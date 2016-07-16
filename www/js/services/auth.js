// This factory is project-independent. Has to have corresponding socket/http based server part.
angular.module('Schedulogy')
    .factory('Auth', function ($http, settings, $rootScope, $window, $q, $rootScope, User, Cordova, $ionicModal, $filter) {
        var Auth = {
            isMe: function (user) {
                if (!this.isAuthenticated()) {
                    return false;
                }
                return user._id === $rootScope.currentUser._id;
            },
            isSuperAdmin: function (role, user) {
                user = user || $rootScope.currentUser;
                return _.contains(user.roles, "superadmin");
            },
            isAuthenticated: function () {
                if ($rootScope.currentUser) {
                    return true;
                }
                if ($window.localStorage.token) {
                    this.processToken();
                    return true;
                }
                return false;
            },
            tryPreauthenticate: function () {
                var defer = $q.defer();
                if ($window.localStorage.token) {
                    $http.post(settings.serverUrl + '/authenticate', {}, {headers: {'Authorization': $window.localStorage.token}})
                        .success(function (data) {
                            Auth.login().then(function () {
                                defer.resolve();
                            });
                        })
                        .error(function () {
                            delete $window.localStorage.token;
                            defer.reject();
                        });
                }
                else {
                    defer.resolve();
                }
                return defer.promise;
            },
            tryLogin: function (user, passphrase) {
                var defer = $q.defer();
                Auth.tryLoginInternal(user, passphrase).then(function () {
                    $window.localStorage.lastLogin = Date.now();
                    $window.localStorage.lastLoginEmail = user.email;
                    $window.localStorage.lastLoginPassword = user.password;
                    defer.resolve();
                });
                return defer.promise;
            },
            tryLoginInternal: function (user, cryptkey_entered) {
                var _this = this, defer = $q.defer();
                $http.post(settings.serverUrl + '/login', user)
                    .success(function (data) {
                        $window.localStorage.token = data.token;
                        $window.localStorage.cryptkey = '';
                        // Only for release we check the new version.
                        // Check if we are on Android or iOS
                        if (settings.checkNewVersion && (Cordova.isAndroid() || Cordova.isIos())) {
                            _this.downloadClientApp(function () {
                                defer.reject("newVersionAvailable");
                            }, function () {
                                defer.resolve();
                            });
                        } else {
                            _this.login().then(function () {
                                defer.resolve();
                            });
                        }
                    })
                    .error(function (data) {
                        delete $window.localStorage.token;
                        defer.reject(data);
                        alert(!data ? 'Disconnected - Check your internet connection.' : 'Error - Wrong username / password.');
                    });
                return defer.promise;
            },
            login: function () {
                var _this = this, defer = $q.defer();
                _this.processToken();
                return defer.promise;
            },
            processToken: function () {
                var payload = JSON.parse($window.atob($window.localStorage.token.split('.')[1].replace(/-/g, "+").replace(/_/g, "/")));
                $rootScope.currentUser = payload.user;
                payload.user.name = decodeURIComponent(payload.user.name);
                payload.user.email = decodeURIComponent(payload.user.email);
                $rootScope.currentUser = User.unserialize(payload.user);
            },
            downloadClientApp: function (callbackOK) {
                if (Cordova.isAndroid()) {
                    $http.get(settings.serverUrl + '/apk?myVersion=' + settings.version).success(function (response) {
                        if (callbackOK)
                            callbackOK();
                        var updateModal = $rootScope.$new(true);
                        $ionicModal.fromTemplateUrl(settings.updatePopupRelativePath, {
                            scope: updateModal,
                            animation: 'fade-in'
                        }).then(function (modal) {
                            updateModal.modal = modal;
                            updateModal.modal.show();
                        });
                        updateModal.download = function () {
                            $window.webintent && $window.webintent.startActivity({
                                action: $window.webintent.ACTION_VIEW,
                                url: settings.serverUrl + response.urlToRetrieve,
                                type: 'text/html'
                            }, function () {
                                updateModal.modal.hide();
                            }, function () {
                                alert('Failed to open URL via Android Intent.');
                            });
                        };
                    });
                } else if (Cordova.isIos()) {
                    $http.get(settings.serverUrl + '/ipa?myVersion=' + settings.version).success(function (response) {
                        if (callbackOK)
                            callbackOK();
                        alert('Application update needs to be installed. Please wait for installation dialog and install. Application will have to be re-opened.');
                        window.open(response.urlToRetrieve, '_self');
                    });
                }
            },
            register: function (user) {
                return $http.post(settings.serverUrl + "/register", user);
            },
            resetPassword: function (user) {
                return $http.post(settings.serverUrl + "/reset-password", user);
            },
            init: function () {
                var defer = $q.defer();

                Auth.tryPreauthenticate().then(function () {
                    defer.resolve();
                });

                return defer.promise;
            },
            changePassword: function (password) {
                return $http.post(settings.serverUrl + "/users/change-password", {
                    password: password
                });
            },
            changePushToken: function () {
                return $http.post(settings.serverUrl + "/users/change-push-token", {
                    token: settings.pushToken
                });
            },
            changePin: function (user) {
                user.email = encodeURIComponent(user.email);
                user.pin = encodeURIComponent(user.pin);
                var defer = $q.defer();
                return defer.promise;
            },
            changeUsername: function (data) {
                data.newName = encodeURIComponent(data.newName);
                var defer = $q.defer();
                return defer.promise;
            },
            logout: function () {
                if (Auth.isAuthenticated())
                    delete $window.localStorage.token;
            }
        };
        return Auth;
    });

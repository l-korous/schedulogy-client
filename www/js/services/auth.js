// This factory is project-independent. Has to have corresponding socket/http based server part.
angular.module('Schedulogy')
    .factory('Auth', function ($http, settings, $rootScope, $window, $q, $rootScope, User) {
        var Auth = {
            fromUtf: function (user) {
                if (user.email)
                    user.email = decodeURIComponent(escape(user.email));
                if (user.username)
                    user.username = decodeURIComponent(escape(user.username));
                return user;
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
            tryLogin: function (user) {
                delete $rootScope.currentUser;
                var _this = this, defer = $q.defer();
                $http.post(settings.serverUrl + '/login', user)
                    .success(function (data) {
                        $window.localStorage.token = data.token;
                        _this.processTokenStoreUser();
                        if ($rootScope.currentUser)
                            defer.resolve(data);
                        else
                            defer.reject('malformedToken');
                    })
                    .error(function (data) {
                        _this.logout();
                        defer.reject(data.msg);
                    });
                return defer.promise;
            },
            processTokenStoreUser: function () {
                var payload = JSON.parse($window.atob($window.localStorage.token.split('.')[1].replace(/-/g, "+").replace(/_/g, "/")));
                $rootScope.currentUser = this.fromUtf({_id: payload.uid, email: payload.uem, username: (payload.uname && payload.uname.length > 1) ? payload.uname : payload.uem, role: payload.uro});
                $window.localStorage.currentUserId = $rootScope.currentUser._id;
            },
            register: function (user) {
                return $http.post(settings.serverUrl + "/register", user);
            },
            changeUsername: function (username) {
                var _this = this, defer = $q.defer();
                User.saveUsername({username: username}, function (data) {
                    $window.localStorage.token = data.token;
                    _this.processTokenStoreUser();
                    defer.resolve();
                }, function () {
                    defer.reject();
                });
                return defer.promise;
            },
            changePassword: function (password) {
                var defer = $q.defer();
                User.savePassword({password: password}, function (data) {
                    defer.resolve();
                }, function () {
                    defer.reject();
                });
                return defer.promise;
            },
            tryPreauthenticate: function () {
                var _this = this, defer = $q.defer();
                $http.post(settings.serverUrl + "/authenticate").success(function () {
                    _this.processTokenStoreUser();
                    defer.resolve();
                }).error(function () {
                    defer.reject();
                });
                return defer.promise;
            },
            checkPasswordResetLink: function (userId, passwordResetHash) {
                return $http.post(settings.serverUrl + "/password-reset-check", {userId: userId, passwordResetHash: passwordResetHash});
            },
            activate: function (password, userId, passwordResetHash) {
                return $http.post(settings.serverUrl + "/activate", {password: password, userId: userId, passwordResetHash: passwordResetHash});
            },
            sendPasswordResetLink: function (email) {
                return $http.post(settings.serverUrl + "/reset-password", {email: email});
            },
            logout: function () {
                delete $rootScope.currentUser;
                $window.localStorage.token && delete $window.localStorage.token;
                $window.localStorage.currentUserId && delete $window.localStorage.currentUserId;
            }
        };
        return Auth;
    });

angular.module('Schedulogy')
    .service('Auth', function ($http, settings, $rootScope, $window, $q, $rootScope, moment, lock, authManager, $timeout, jwtHelper, ModalService, $state, constants, $cookies) {
        var _this = this;

        _this.showLoginLock = function () {
            lock.show();
        };

        _this.logout = function () {
            $window.localStorage.removeItem('idToken');
            $window.localStorage.removeItem('profile');
            $window.localStorage.removeItem('token');
            $window.localStorage.removeItem('currentUser');
            authManager.unauthenticate();
            $rootScope.isAuthenticated = false;
            $cookies.put('schedulogyAppAccessed', '1',
                {
                    path: '/',
                    domain: '.schedulogy.com',
                    expires: 'Thu, 01 Jan 1970 00:00:01 GMT'
                });
            $cookies.remove('JSESSIONID');
        };

        _this.processToken = function (token) {
            $window.localStorage.setItem('token', token);

            var payload = JSON.parse($window.atob($window.localStorage.token.split('.')[1].replace(/-/g, "+").replace(/_/g, "/")));

            $rootScope.currentUser = {
                _id: payload.uid,
                email: decodeURIComponent(escape(payload.uem)),
                role: payload.uro,
                tenantId: payload.tid,
                originalTenantId: payload.otid
            };

            $window.localStorage.setItem('currentUser', JSON.stringify($rootScope.currentUser));
        };

        _this.registerAuthenticationListener = function () {
            lock.on('authenticated', function (authResult) {
                var defer = $q.defer();
                $window.localStorage.setItem('idToken', authResult.idToken);
                delete $rootScope.currentUser;
                $http.post(settings.serverUrl + '/loginSocial', {authOToken: authResult.idToken, timeZone: moment.tz.guess()})
                    .success(function (data) {
                        _this.processToken(data.token);

                        authManager.authenticate();

                        $state.go(constants.defaultStateAfterLogin, {}, {location: false});

                        if (data.runIntro)
                            ModalService.openModal('tutorial');

                        defer.resolve(data);
                    })
                    .error(function (data) {
                        _this.logout();
                        defer.reject(data.msg);
                    });

                $timeout(function () {
                    lock.hide();
                }, 2000);

                return defer.promise;
            });
        };

        _this.isAuthenticated = function () {
            if (!authManager.isAuthenticated())
                return false;

            if (!$window.localStorage.currentUser)
                return false;

            if (!$window.localStorage.token)
                return false;

            if (jwtHelper.decodeToken($window.localStorage.token).exp < moment().unix())
                return false;

            if (!$rootScope.currentUser)
                $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
            return true;
        };
    });

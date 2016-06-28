angular.module('Scheduler', ['ngCookies', 'ngResource', 'ngMessages', 'ngRoute', 'mgcrea.ngStrap', 'ui.router', 'ionic', 'daypilot'])
        .value('serverUrl', 'http://localhost:3000')
        .value('appVersion', '2.3.0')
        .constant('applicationName', 'Scheduler')
        // Fix datetime - has to correspond to the server !!!
        .constant('fixedDate', {on: true, date: moment('2016-07-01 08:00')})
        .constant('defaultStateAfterLogin', 'main.calendar')
        .constant('dateTimeFormatEdit', 'YYYY-MM-DDTHH:mm')
        .constant('dateTimeFormatDisplay', 'YYYY-MM-DD HH:mm')
        .value('refUploadPrefix', '/tmp/files')
        .value('checkNewVersion', false)
        .config(['$stateProvider', '$urlRouterProvider', 'defaultStateAfterLogin', function ($stateProvider, $urlRouterProvider, defaultStateAfterLogin) {
                $stateProvider
                        .state('login', {
                            url: '/login',
                            authenticate: false,
                            templateUrl: 'templates/login.html',
                            controller: 'LoginCtrl'
                        })
                        .state('main', {
                            url: '/main',
                            templateUrl: 'templates/main.html',
                            abstract: true,
                            controller: 'MainCtrl'
                        })

                        .state('main.calendar', {
                            url: '/calendar',
                            authenticate: false,
                            views: {
                                main: {
                                    templateUrl: 'templates/calendar.html',
                                    controller: 'CalendarCtrl',
                                    authenticate: false
                                }
                            }
                        });
                        
                // if none of the above states are matched, use this as the fallback
                $urlRouterProvider.otherwise(defaultStateAfterLogin);
            }])
        .run(function ($rootScope, $state, $window, defaultStateAfterLogin) {
            // This must be defined here, when the $state is defined.
            $rootScope.goToLogin = function () {
                $state.transitionTo("login");
            };
            $rootScope.showServerError = function () {
                $rootScope.$broadcast('disconnectedNetwork');
            };
            $rootScope.hideServerError = function () {
                $rootScope.$broadcast('connectedNetwork');
            };
            
            $state.go(defaultStateAfterLogin);
        });

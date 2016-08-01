angular.module('Schedulogy', ['ngCookies', 'ngResource', 'ui.router', 'ui.calendar', 'ionic', 'angularMoment', 'ionic-datepicker', 'ionic-timepicker'])
    .constant('settings', {
        serverUrl: 'http://localhost:8080/api',
        loadingTemplate: 'Loading,<br />please wait...',
        appVersion: '0.1.0',
        applicationName: 'Schedulogy',
        minPasswordGroups: 1,
        minPasswordLength: 1,
        // Fix datetime - has to correspond to the server !!!
        fixedBTime: {
            on: false,
            date: 'Fri Jul 01 2016 08:00:00 GMT+0200'
        },
        weeks: 26,
        startHour: 8,
        endHour: 17,
        minuteGranularity: 30,
        // This has to be exactly calculated using minGranularity
        slotsPerHour: 2, // === (60 / minGranularity)
        defaultTaskDuration: 2,
        defaultTaskType: 'fixed',
        defaultStateAfterLogin: 'main.calendar',
        noPrerequisitesToListMsg: 'No possible prerequisites to list. Possible prerequisites are any tasks that can end before the due date of this one.',
        noDependenciesToListMsg:  'No possible dependent tasks to list. Only floating tasks, that are due after this task can be completed, are possible dependent tasks.',
        dateTimeFormatEdit: 'YYYY-MM-DDTHH:mm',
        dateTimeFormatDisplay: 'YYYY-MM-DD HH:mm',
        shiftAgendaRows: 293,
        shiftCalendar: 220,
        minCalendarRowHeight: 45,
        checkNewVersion: false,
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
        eventColor: {
            fixed: '#387ef5',
            fixedAllDay: '#387ef5',
            floating: '#ffa400'
        },
        maxEventDuration: {
            fixed: 24,
            fixedAllDay: 14,
            // This needs to correspond to startHour -> endHour
            floating: 9
        },
        eventBorderColor: '#111',
        passwordResetErrorInfo: function (msg) {
            switch (msg) {
                case '!existing':
                    return 'We could not find the requested user. Please register first.';
                    break;
                case 'password':
                    return 'The link is broken. Please make sure you used the full link you got in your e-mail.';
                    break;
                case 'used':
                    return 'The password has already been set. Please reset your password by following the link on the login screen in case you have forgotten it.';
            }
            return 'General error';
        },
        registrationErrorInfo: function (msg) {
            switch (msg) {
                case 'existing':
                    return 'An account with this e-mail address already exists.';
                    break;
                case 'error':
                    return 'Something is wrong. Please try again.';
                    break;
            }
            return 'General error';
        },
        loginErrorInfo: function (msg) {
            switch (msg) {
                case 'inactive':
                    return 'This user account is inactive. Please follow the instructions you received via e-mail to activate it.';
                case 'password':
                    return 'Wrong e-mail / password combination';
            }
            return 'General error';
        },
        registrationSuccessInfo: 'An e-mail with password setup instructions has been sent to your e-mail address.',
        passwordResetSuccessInfo: 'Password successfully set.',
        forgottenPasswordSuccessInfo: 'An e-mail with password setup instructions has been sent to your e-mail address.',
        forgottenPasswordErrorInfo: function (msg) {
            switch (msg) {
                case '!existing':
                    return 'We could not find the requested user. Please register first.';
                    break;
            }
            return 'General error';
        }
    })
    .config(['$stateProvider', '$urlRouterProvider', 'settings', function ($stateProvider, $urlRouterProvider, settings) {
            $stateProvider
                .state('main', {
                    templateUrl: 'templates/main.html',
                    controller: 'MainCtrl',
                    abstract: true})
                .state('main.calendar',
                    {
                        name: 'calendar',
                        parent: 'main',
                        templateUrl: 'templates/calendar.html',
                        controller: 'CalendarCtrl'
                    })
                .state('main.login', {
                    url: '/login',
                    authenticate: false,
                    templateUrl: 'templates/login.html',
                    controller: 'LoginCtrl'
                })
                .state('main.registration', {
                    url: '/registration',
                    authenticate: false,
                    templateUrl: 'templates/registration.html',
                    controller: 'RegistrationCtrl'
                })
                .state('main.forgottenPassword', {
                    url: '/forgotten-password',
                    authenticate: false,
                    templateUrl: 'templates/forgottenPassword.html',
                    controller: 'ForgottenPasswordCtrl'
                })
                .state('main.passwordReset', {
                    url: '/password-reset',
                    authenticate: false,
                    templateUrl: 'templates/passwordReset.html',
                    controller: 'PasswordResetCtrl'
                });

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise(settings.defaultStateAfterLogin);
        }])
    .config(function (ionicDatePickerProvider, settings, moment) {
        var datePickerObj = {
            setLabel: 'Set',
            todayLabel: 'Today',
            closeLabel: 'Close',
            mondayFirst: true,
            monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
            templateType: 'popup',
            from: new Date(2012, 8, 1),
            to: moment(new Date()).add(settings.weeks, 'w').toDate(),
            showTodayButton: true,
            dateFormat: 'dd MMMM yyyy',
            closeOnSelect: true,
            disableWeekdays: []
        };
        ionicDatePickerProvider.configDatePicker(datePickerObj);
    })
    .config(function (ionicTimePickerProvider, settings) {
        var timePickerObj = {
            format: 24,
            step: settings.minuteGranularity,
            setLabel: 'Set',
            closeLabel: 'Close'
        };
        ionicTimePickerProvider.configTimePicker(timePickerObj);
    })
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push(function ($rootScope, $q, $window) {
            return {
                request: function (config) {
                    config.headers.Authorization = $window.localStorage.token ? $window.localStorage.token : '';
                    config.headers.Xuser = $window.localStorage.currentUserId ? $window.localStorage.currentUserId : '';
                    return config;
                },
                responseError: function (response) {
                    if (response.status === 401 || response.status === 403) {
                        delete $window.localStorage.token;
                        delete $window.localStorage.currentUserId;
                        $rootScope.goToLogin();
                    }
                    return $q.reject(response);
                }
            };
        });
    })
    .run(function ($rootScope, $state, settings, Auth, $timeout) {
        $rootScope.allSet = false;

        // Check stuff when changing state.
        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
            if (((fromState.name === 'main.login' && toState.name === 'main.registration') || (fromState.name === 'main.registration' && toState.name === 'main.login')) && !Auth.isAuthenticated()) {
                return;
            } else if (((fromState.name === 'main.login' && toState.name === 'main.passwordReset') || (fromState.name === 'main.passwordReset' && toState.name === 'main.login')) && !Auth.isAuthenticated()) {
                return;
            } else if (toState.name !== 'login' && toState.name !== 'registration' && !Auth.isAuthenticated()) {
                // User isn’t authenticated
                $rootScope.goToLogin();
                event.preventDefault();
            } else if (toState.name === 'main.login' && Auth.isAuthenticated()) {
                if (fromState.name !== '')
                    event.preventDefault();
            }
        });

        Auth.tryPreauthenticate().then(function () {
            $state.go(settings.defaultStateAfterLogin);
            $timeout(function(){$rootScope.allSet = true;});
        }, function () {
            $rootScope.goToLogin();
            $timeout(function(){$rootScope.allSet = true;});
        });

        // This must be defined here, when the $state is defined.
        $rootScope.goToLogin = function () {
            Auth.logout();

            if ($state.current.name !== 'main.login') {
                $state.transitionTo("main.login");
            }
        };
        
        $rootScope.keyUpHandler = function (keyCode, enterBlockPredicate) {
            if (keyCode === 13 && !enterBlockPredicate) {
                $rootScope.$broadcast('Enter');
            }
            if (keyCode === 27)
                $rootScope.$broadcast('Esc');
        };
    });

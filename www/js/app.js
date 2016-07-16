angular.module('Schedulogy', ['ngCookies', 'ngResource', 'ui.router', 'ui.calendar', 'ionic', 'angularMoment', 'ionic-datepicker', 'ionic-timepicker'])
    .constant('settings', {
        serverUrl: 'http://localhost:8080',
        appVersion: '0.1.0',
        applicationName: 'Schedulogy',
        // Fix datetime - has to correspond to the server !!!
        fixedBTime: {
            on: true,
            date: 'Fri Jul 01 2016 08:00:00 GMT+0200'
        },
        weeks: 6,
        startHour: 8,
        endHour: 17,
        defaultTaskDuration: 1,
        defaultTaskType: 'fixed',
        defaultStateAfterLogin: 'main.calendar',
        dateTimeFormatEdit: 'YYYY-MM-DDTHH:mm',
        dateTimeFormatDisplay: 'YYYY-MM-DD HH:mm',
        shiftAgendaRows: 293,
        shiftCalendar: 220,
        minCalendarRowHeight: 45,
        checkNewVersion: false,
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
        eventColor: {
            fixed: '#f00',
            fixedAllDay: '#0f0',
            floating: '#00f'
        }
    })
    .config(['$stateProvider', '$urlRouterProvider', 'settings', function ($stateProvider, $urlRouterProvider, settings) {
            $stateProvider
                .state('login', {
                    url: '/login',
                    authenticate: false,
                    templateUrl: 'templates/login.html',
                    controller: 'LoginCtrl'
                })
                .state('registration', {
                    url: '/registration',
                    authenticate: false,
                    templateUrl: 'templates/registration.html',
                    controller: 'RegistrationCtrl'
                })
                .state('main', {
                    authenticate: false,
                    templateUrl: 'templates/main.html',
                    controller: 'MainCtrl',
                    abstract: true})
                .state('main.calendar',
                    {
                        authenticate: false,
                        name: 'calendar',
                        parent: 'main',
                        templateUrl: 'templates/calendar.html',
                        controller: 'CalendarCtrl'
                    });

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise(settings.defaultStateAfterLogin);
        }])
    .config(function (ionicDatePickerProvider) {
        var datePickerObj = {
            setLabel: 'Set',
            todayLabel: 'Today',
            closeLabel: 'Close',
            mondayFirst: true,
            weeksList: ["S", "M", "T", "W", "T", "F", "S"],
            monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
            templateType: 'popup',
            from: new Date(2012, 8, 1),
            to: new Date(2018, 8, 1),
            showTodayButton: true,
            dateFormat: 'dd MMMM yyyy',
            closeOnSelect: true,
            disableWeekdays: [6]
        };
        ionicDatePickerProvider.configDatePicker(datePickerObj);
    })
    .config(function (ionicTimePickerProvider, settings) {
        var timePickerObj = {
            format: 24,
            step: 60,
            setLabel: 'Set',
            closeLabel: 'Close'
        };
        ionicTimePickerProvider.configTimePicker(timePickerObj);
    })
    .run(['$rootScope', '$state', 'settings', 'Auth', function ($rootScope, $state, settings, Auth) {

            // Check stuff when changing state.
            $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
                if (((fromState.name === 'login' && toState.name === 'registration') || (fromState.name === 'registration' && toState.name === 'login')) && !Auth.isAuthenticated()) {
                    return;
                } else if (((fromState.name === 'login' && toState.name === 'password_reset') || (fromState.name === 'password_reset' && toState.name === 'login')) && !Auth.isAuthenticated()) {
                    return;
                } else if (toState.name !== 'login' && toState.name !== 'registration' && !Auth.isAuthenticated()) {
                    // User isn’t authenticated
                    $rootScope.goToLogin();
                    event.preventDefault();
                } else if (toState.name === 'login' && Auth.isAuthenticated()) {
                    if (fromState.name !== '')
                        event.preventDefault();
                }
            });

            $rootScope.autoAuth = Auth.init();
            $rootScope.autoAuth.then(function () {
                if ($rootScope.currentUser) {
                    $state.go(settings.defaultStateAfterLogin);
                    Auth.changePushToken();
                }
                else {
                    $rootScope.goToLogin();
                }
            });

            // This must be defined here, when the $state is defined.
            $rootScope.goToLogin = function () {
                Auth.logout();
                $state.transitionTo("login");
            };
        }]);

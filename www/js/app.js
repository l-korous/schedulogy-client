angular.module('Schedulogy', ['ngResource', 'ui.router', 'ui.calendar', 'ionic', 'angularMoment', 'ionic-datepicker', 'ionic-timepicker', 'ngLodash', 'ngCordova'])
    .constant('settings', {
        serverUrl: 'http://localhost:8080/api',
        //serverUrl: 'http://52.59.242.96/api',
        loadingTemplate: 'Loading,<br />please wait...',
        appVersion: '2.2.3-b',
        applicationName: 'Schedulogy',
        minPasswordGroups: 1,
        minPasswordLength: 1,
        // Fix datetime - has to correspond to the server !!!
        fixedBTime: {
            on: false,
            date: 'Sat Sep 03 2016 12:00:00 GMT+0200'
        },
        weeks: 26,
        defaultHourShiftFromNow: 24,
        // This is recommended by ionic
        smallScreen: 768,
        startHour: 0,
        endHour: 24,
        minuteGranularity: 30,
        // This has to be exactly calculated using minuteGranularity
        slotsPerHour: 2, // === (60 / minuteGranularity)
        // For 0 - is not all day, 1 - is all day
        defaultTaskDuration: [4, 1],
        defaultTaskType: 'event',
        defaultStateAfterLogin: 'main.calendar',
        noPrerequisitesToListMsg: 'No possible prerequisites to list. Possible prerequisites are any tasks that can end before the due date of this one.',
        noDependenciesToListMsg: 'No possible dependent tasks to list. Only floating tasks, that are due after this task can be completed, are possible dependent tasks.',
        shiftCalendar: {
            normal: 103,
            smallScreen: 80
        },
        minCalendarRowHeight: 45,
        checkNewVersion: false,
        dateFormat: 'MMM, Do',
        timeFormat: 'HH:mm',
        itemColor: {
            event: '#387ef5',
            task: '#ffa400',
            reminder: '#bd0000'
        },
        maxEventDuration: [48, 14],
        itemBorderColor: '#111',
        itemTextColor: '#fff',
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
            return 'General error.';
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
            return 'General error.';
        },
        loginErrorInfo: function (msg) {
            switch (msg) {
                case 'inactive':
                    return 'This user account is inactive. Please follow the instructions you received via e-mail to activate it.';
                case 'password':
                    return 'Wrong e-mail / password combination.';
            }
            return 'General error.';
        },
        registrationSuccessInfo: 'An e-mail with password setup instructions has been sent to the e-mail address. Please check your inbox.',
        passwordResetSuccessInfo: 'Password successfully set.',
        forgottenPasswordSuccessInfo: 'An e-mail with password reset instructions has been sent to your e-mail address. Please check your inbox.',
        feedbackSuccessInfo: 'Feedback received and greatly appreciated.',
        feedbackErrorInfo: function (msg) {
            return 'Something went wrong.';
        },
        forgottenPasswordErrorInfo: function (msg) {
            switch (msg) {
                case '!existing':
                    return 'We could not find the requested user. Please register first.';
                    break;
            }
            return 'General error.';
        },
        iCalUploadError: 'File upload failed. Please check that you only upload valid iCal files.',
        iCalUploadSuccess: 'File uploaded successfully.',
        resourceSaveSuccessInfo: 'Resource saved successfully.'
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
                .state('login', {
                    url: '/login',
                    templateUrl: 'templates/login.html'
                })
                .state('registration', {
                    url: '/registration',
                    templateUrl: 'templates/registration.html'
                })
                .state('forgottenPassword', {
                    url: '/forgotten-password',
                    templateUrl: 'templates/forgottenPassword.html'
                })
                .state('passwordReset', {
                    url: '/password-reset',
                    templateUrl: 'templates/passwordReset.html'
                });
        }])

    // ionic configuration
    .config(function ($ionicConfigProvider, $compileProvider) {
        $ionicConfigProvider.tabs.position('top');
        $ionicConfigProvider.views.maxCache(25);
        $ionicConfigProvider.views.forwardCache(true);
        $ionicConfigProvider.form.checkbox("square");
        $ionicConfigProvider.backButton.text("");
        if (!ionic.Platform.isAndroid()) {
            $ionicConfigProvider.backButton.previousTitleText(true);
            $ionicConfigProvider.scrolling.jsScrolling(false);
            $ionicConfigProvider.views.transition("none");
        }
        $compileProvider.debugInfoEnabled(false);
        // Ionic gesture workaround
        ionic.Gestures.gestures.Hold.defaults.hold_threshold = 1;
    })
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
            showTodayButton: false,
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
        $httpProvider.defaults.withCredentials = true;
        $httpProvider.interceptors.push(function ($rootScope, $q, $window, $timeout, $state, moment) {
            return {
                request: function (config) {
                    config.headers.Authorization = $window.localStorage.token ? $window.localStorage.token : '';
                    config.headers.Xuser = $window.localStorage.currentUserId ? $window.localStorage.currentUserId : '';
                    config.headers.utcOffset = moment().utcOffset();
                    return config;
                },
                responseError: function (response) {
                    if (response.status === 401 || response.status === 403) {
                        delete $window.localStorage.token;
                        delete $window.localStorage.currentUserId;
                        $timeout(function () {
                            if (['login', 'registration', 'passwordReset'].indexOf($state.current.name) === -1)
                                $rootScope.goToLogin();
                        }, 500);
                    }
                    return $q.reject(response);
                }
            };
        });
    })
    .run(function ($rootScope, $state, settings, Auth, $location, $window, MyItems, MyResources, ModalService, Cordova, $cordovaNetwork) {
        // Settings - so that they are accessible from anywhere.
        $rootScope.settings = settings;

        // This must be defined here, when the $state is defined.
        $rootScope.goToLogin = function () {
            Auth.logout();
            $location.path('');
            $location.search('');
            if ($state.current.name !== 'login') {
                $state.go("login", {}, {location: false, reload: true});
            }
        };

        // Preauthentication - only on browser
        if (!Cordova.isBrowser()) {
            Auth.tryPreauthenticate().then(function () {
                $location.path('');
                $location.search('');
                MyItems.refresh();
                MyResources.refresh();
                $state.go(settings.defaultStateAfterLogin, {}, {location: false});
            });
        }
        else if (Auth.isAuthenticated()) {
            Auth.processTokenStoreUser();
            $location.path('');
            $location.search('');
            MyItems.refresh();
            MyResources.refresh();
            $state.go(settings.defaultStateAfterLogin, {}, {location: false});
        }
        else
            $rootScope.goToLogin();

        // Handle smallScreen
        $rootScope.smallScreen = ($window.innerWidth < settings.smallScreen);
        angular.element($window).bind('resize', function () {
            $rootScope.smallScreen = ($window.innerWidth < settings.smallScreen);
        });

        // Controls display of 'loading'
        $rootScope.isLoading = true;

        // Check stuff when changing state.
        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
            $location.path('');
            $location.search('');
            if ((['login', 'registration', 'passwordReset'].indexOf(toState.name) === -1) && !Auth.isAuthenticated()) {
                // User isn’t authenticated
                $rootScope.goToLogin();
                event.preventDefault();
            } else if (toState.name === 'login' && Auth.isAuthenticated()) {
                if (fromState.name !== '')
                    event.preventDefault();
            }
        });

        // Online / offline handlers.
        if (Cordova.isBrowser()) {
            document.addEventListener("deviceready", function () {
                window.addEventListener("online", function (e) {
                    $rootScope.isOffline = false;
                }, false);
                window.addEventListener("offline", function (e) {
                    $rootScope.isOffline = true;
                }, false);
                $rootScope.isOffline = !navigator.onLine;
            });
        }
        else {
            document.addEventListener("deviceready", function () {
                $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
                    $rootScope.isOffline = false;
                });
                $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                    $rootScope.isOffline = true;
                });
                $rootScope.isOffline = !$cordovaNetwork.isOnline();

                document.addEventListener("resume", function () {
                    $('#theOnlyCalendar').fullCalendar('next');
                }, false);
            });
        }

        // Update now indicator periodically.
        setInterval(function () {
            $('#theOnlyCalendar').fullCalendar('updateNowIndicator');
        }, 60000);

        // Key bindings.
        $rootScope.keyUpHandler = function (keyCode) {
            if (keyCode === 13 && document.activeElement.tagName !== 'TEXTAREA') {
                $rootScope.$broadcast('Enter');
            }
            else if (keyCode === 27)
                $rootScope.$broadcast('Esc');
            else if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                if (keyCode === 82) {
                    MyItems.newCurrentItem('reminder');
                    ModalService.openModal('reminder');
                }
                if (keyCode === 69) {
                    MyItems.newCurrentItem('event');
                    ModalService.openModal('event');
                }
                if (keyCode === 84) {
                    MyItems.newCurrentItem('task');
                    ModalService.openModal('task');
                }
                else if (keyCode === 37)
                    $('#theOnlyCalendar').fullCalendar('prevLong');

                else if (keyCode === 39)
                    $('#theOnlyCalendar').fullCalendar('nextLong');
            }
        };
    });

angular.module('Schedulogy', ['ngResource', 'ui.router', 'ui.calendar', 'ionic', 'angularMoment', 'ionic-datepicker', 'ionic-timepicker', 'ngLodash', 'ngCordova', 'ngCookies', 'auth0', 'auth0.lock', 'angular-jwt'])
    .config(function ($stateProvider) {
        $stateProvider
            .state('main', {
                templateUrl: 'templates/main.html',
                controller: 'MainCtrl',
                abstract: true})
            .state('calendar',
                {
                    name: 'calendar',
                    parent: 'main',
                    templateUrl: 'templates/calendar.html',
                    controller: 'CalendarCtrl'
                })
            .state('empty',
                {
                    name: 'empty',
                    templateUrl: 'templates/empty.html'
                });
    })
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
    .config(function (lockProvider, settings, jwtOptionsProvider) {
        lockProvider.init({
            clientID: settings.AUTH0_CLIENT_ID,
            domain: settings.AUTH0_DOMAIN,
            options: {
                auth: {
                    redirect: false,
                    sso: false,
                    connectionScopes: {
                        'google-oauth2': ['openid', 'email', 'profile'],
                        'linkedin': []
                    }
                },
                autoclose: true,
                closable: false,
                theme: {
                    labeledSubmitButton: false,
                    logo: "img/icon72.png",
                    primaryColor: "#387ef5"
                },
                languageDictionary: {
                    title: "SCHEDULOGY"
                }
            }
        });

        jwtOptionsProvider.config({
            tokenGetter: function () {
                return localStorage.getItem('idToken');
            }
        });
    })
    .config(function (ionicDatePickerProvider, ionicTimePickerProvider, constants, moment) {
        var datePickerObj = {
            setLabel: 'Set',
            todayLabel: 'Today',
            closeLabel: 'Close',
            mondayFirst: true,
            monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
            templateType: 'popup',
            from: new Date(2012, 8, 1),
            to: moment(new Date()).add(constants.weeks, 'w').toDate(),
            showTodayButton: false,
            dateFormat: 'dd MMMM yyyy',
            closeOnSelect: true,
            disableWeekdays: []
        };
        ionicDatePickerProvider.configDatePicker(datePickerObj);

        var timePickerObj = {
            format: 24,
            step: constants.minuteGranularity,
            setLabel: 'Set',
            closeLabel: 'Close'
        };
        ionicTimePickerProvider.configTimePicker(timePickerObj);
    })
    .config(function ($httpProvider) {
        $httpProvider.defaults.withCredentials = true;
        $httpProvider.interceptors.push(function ($rootScope, $q, $window) {
            return {
                request: function (config) {
                    config.headers.Authorization = $window.localStorage.token ? $window.localStorage.token : '';
                    config.headers.Xuser = $rootScope.currentUser ? $rootScope.currentUser._id : '';
                    return config;
                },
                responseError: function (response) {
                    if (response.status === 401 || response.status === 403) {
                        $rootScope.goToLogin(true);
                    }
                    return $q.reject(response);
                }
            };
        });
    })
    .run(function ($rootScope, $state, settings, Auth, $location, $window, MyItems, ModalService, Cordova, $cordovaNetwork, $timeout, $interval, lock, authManager, constants, MyResources, MyUsers, $ionicPlatform) {
        // Settings - so that they are accessible from anywhere.
        $rootScope.settings = settings;
        $rootScope.constants = constants;
        $rootScope.isAuthenticated = false;
        Auth.registerAuthenticationListener();
        lock.interceptHash();
        authManager.checkAuthOnRefresh();

        $rootScope.refreshStuff = function () {
			if(Auth.isAuthenticated()) {
				MyItems.refresh();
				MyResources.refresh();
				MyUsers.refresh();
			}
        };

        function initStuff() {
            ModalService.init();
        }

        function processOnlineOffline() {
            if ($rootScope.isOffline) {
                $("#isOffline").addClass('showCustom');
                initStuff();
                $("#isLoading").removeClass('showCustom');
            }
            else {
                initStuff();
                $rootScope.refreshStuff();
                $rootScope.calendarRenderedListener = $rootScope.$on('calendarRendered', function () {
                    $("#isLoading").removeClass('showCustom');
                    $rootScope.calendarRenderedListener();
                });
            }
        }

        $rootScope.isOffline = !window.navigator.onLine;
        document.addEventListener("online", function (e) {
            $rootScope.isOffline = false;
            $("#isOffline").removeClass('showCustom');
        }, false);
        document.addEventListener("offline", function (e) {
            $rootScope.isOffline = true;
            $("#isOffline").addClass('showCustom');
        }, false);
        $window.addEventListener("online", function (e) {
            $rootScope.isOffline = false;
            $("#isOffline").removeClass('showCustom');
            $rootScope.refreshStuff();
        }, false);
        $window.addEventListener("offline", function (e) {
            $rootScope.isOffline = true;
            $("#isOffline").addClass('showCustom');
        }, false);

        // Online / offline handlers.
        if (Cordova.isAndroid()) {
            document.addEventListener("deviceready", function () {
                cordova.plugins.backgroundMode.enable();

                $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
                    $rootScope.isOffline = false;
                    $("#isOffline").removeClass('showCustom');
                    $rootScope.refreshStuff();
                });
                $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                    $rootScope.isOffline = true;
                    $("#isOffline").addClass('showCustom');
                });
                if (!$cordovaNetwork.isOnline()) {
                    $rootScope.isOffline = false;
                    $("#isOffline").addClass('showCustom');
                }

                processOnlineOffline();

                document.addEventListener("resume", function () {
                    if (Auth.isAuthenticated()) {
                        $timeout(function () {
                            $rootScope.focusedEl = $(':focus');
                            $('#theOnlyCalendar').fullCalendar('option', 'now', MyItems.getBTime);
                            $('#theOnlyCalendar').fullCalendar('updateNowIndicator');
                            $rootScope.refreshStuff();
                            $timeout(function () {
                                $rootScope.focusedEl.focus();
                            });
                        });
                    }
                });

                $ionicPlatform.registerBackButtonAction(function (event) {
                    if (ModalService.currentModals.length > 0)
                        ModalService.closeModalInternal();
                }, 100);
            });
        }
        else {
            processOnlineOffline();
        }

        // Update now indicator periodically.
        $interval(function () {
            $rootScope.focusedEl = $(':focus');
            $('#theOnlyCalendar').fullCalendar('option', 'now', MyItems.getBTime);
            $('#theOnlyCalendar').fullCalendar('updateNowIndicator');
            $timeout(function () {
                $rootScope.focusedEl.focus();
            });
        }, 60000);

        // Key bindings.
        $rootScope.keyUpHandler = function (keyCode, ctrlKey) {
            if (keyCode === 13 && document.activeElement.tagName !== 'TEXTAREA') {
                $rootScope.$broadcast('Enter');
            } else if (keyCode === 27)
                $rootScope.$broadcast('Esc');
            else if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                // On login screen we do not support anything.
                if ($state.current.name === 'empty')
                    return;

                if (keyCode === 72 && !ctrlKey) {
                    ModalService.openModal('help');
                }

                if (keyCode === 82 && !ctrlKey) {
                    MyItems.newCurrentItem('reminder');
                    ModalService.openModal('reminder');
                }
                if (keyCode === 69 && !ctrlKey) {
                    MyItems.newCurrentItem('event');
                    ModalService.openModal('event');
                }
                if (keyCode === 84 && !ctrlKey) {
                    MyItems.newCurrentItem('task');
                    ModalService.openModal('task');
                }
                if ($('#theOnlyCalendar').fullCalendar('getView').name === 'month' || $('#theOnlyCalendar').fullCalendar('getView').name === 'listMonth') {
                    if (keyCode === 38 && !ctrlKey)
                        $('#theOnlyCalendar').fullCalendar('prev');
                    if (keyCode === 40 && !ctrlKey)
                        $('#theOnlyCalendar').fullCalendar('next');
                    if (keyCode === 38 && ctrlKey)
                        $('#theOnlyCalendar').fullCalendar('prevLong');
                    if (keyCode === 40 && ctrlKey)
                        $('#theOnlyCalendar').fullCalendar('nextLong');
                }

                if (keyCode === 37 && !ctrlKey)
                    $('#theOnlyCalendar').fullCalendar('prev');
                if (keyCode === 39 && !ctrlKey)
                    $('#theOnlyCalendar').fullCalendar('next');
                if (keyCode === 37 && ctrlKey)
                    $('#theOnlyCalendar').fullCalendar('prevLong');
                if (keyCode === 39 && ctrlKey)
                    $('#theOnlyCalendar').fullCalendar('nextLong');
            }
        };

        // This must be defined here, when the $state is defined.
        $rootScope.goToLogin = function (forceReload) {
            Auth.logout();
            if (forceReload)
                $window.location.reload();

            Auth.showLoginLock();
        };

        if (Auth.isAuthenticated()) {
            $rootScope.isAuthenticated = true;
            $location.path('');
            $location.search('');
            $state.go(constants.defaultStateAfterLogin, {}, {location: false});
            $rootScope.$broadcast('authenticated');
        } else {
            $rootScope.goToLogin();
        }

        // Handle smallScreen
        $rootScope.smallScreen = ($window.innerWidth < constants.smallScreen);
        $rootScope.browser = Cordova.isBrowser();
        angular.element($window).bind('resize', function () {
            $rootScope.smallScreen = ($window.innerWidth < constants.smallScreen);
        });
    });

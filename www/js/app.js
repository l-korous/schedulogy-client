angular.module('Schedulogy', ['ngResource', 'ui.router', 'ui.calendar', 'ionic', 'angularMoment', 'ngLodash', 'ngCordova', 'ngCookies', 'auth0', 'auth0.lock', 'angular-jwt'])
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
    .run(function ($rootScope, $state, settings, Auth, $location, $window, MyItems, ModalService, Cordova, $cordovaNetwork, $timeout, $interval, lock, authManager, constants, MyResources, MyUsers, $ionicPlatform, $q) {
        // Settings - so that they are accessible from anywhere.
        $rootScope.settings = settings;
        $rootScope.constants = constants;
        $rootScope.isAuthenticated = false;
        Auth.registerAuthenticationListener();
        lock.interceptHash();
        authManager.checkAuthOnRefresh();

        ModalService.init();

        $rootScope.refreshWidget = function () {
            if (Cordova.isAndroid()) {
                ace.android.appWidget.clear();

                $rootScope.currentItems = MyItems.getCurrentItems().slice(0).sort(function (a, b) {
                    return !a.startTimeText;
                });

                ace.android.appWidget.add('* NEW Reminder');
                ace.android.appWidget.add('* NEW Event');
                ace.android.appWidget.add('* NEW Task');

                $rootScope.currentItems.forEach(function (item) {
                    ace.android.appWidget.add((item.startTimeText ? item.startTimeText + ' | ' : '') + item.title + ' (' + item.type.toUpperCase() + ')');
                });
            }
        };

        $rootScope.refreshStuff = function () {
            var d = $q.defer();
            if (Auth.isAuthenticated()) {
                MyResources.refresh();
                MyUsers.refresh();
                MyItems.refresh().then(function () {
                    $rootScope.refreshWidget();
                    $timeout(function () {
                        $('#theOnlyCalendar').fullCalendar('stopRefreshingSpinner');
                    }, 1000);
                    d.resolve();
                });
            }
            else
                d.resolve();
            return d.promise;
        };

        function processOnlineOffline(isOnline) {
            if (isOnline) {
                $("#isOffline").removeClass('showCustom');
                $rootScope.calendarRenderedListener = $rootScope.$on('calendarRendered', function () {
                    $rootScope.refreshStuff();
                    $rootScope.calendarRenderedListener();
                });
            }
            else {
                $("#isOffline").addClass('showCustom');
            }
        }

        // Online / offline handlers.
        if (Cordova.isAndroid()) {
            document.addEventListener("deviceready", function () {

                ace.addEventListener("android.intentchanged", checkForWidgetActivation);

                function checkForWidgetActivation() {
                    ace.android.getIntent().invoke("getIntExtra", "widgetSelectionIndex", -1, function (value) {
                        if (value === 0)
                        {
                            MyItems.newCurrentItem('reminder');
                            ModalService.openModal('reminder');
                        }
                        if (value === 1)
                        {
                            MyItems.newCurrentItem('event');
                            ModalService.openModal('event');
                        }
                        if (value === 2)
                        {
                            MyItems.newCurrentItem('task');
                            ModalService.openModal('task');
                        }
                        else if (value > -1)
                        {
                            var item = $rootScope.currentItems[value];
                            MyItems.setCurrentItem(item._id);
                            ModalService.openModal(item.type);
                        }
                    });
                }

                processOnlineOffline($cordovaNetwork.isOnline());

                cordova.plugins.backgroundMode.enable();

                $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
                    processOnlineOffline(true);
                });
                $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                    processOnlineOffline(false);
                });

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
            processOnlineOffline(window.navigator.onLine);

            document.addEventListener("online", function (e) {
                processOnlineOffline(true);
            }, false);
            document.addEventListener("offline", function (e) {
                processOnlineOffline(false);
            }, false);
            $window.addEventListener("online", function (e) {
                processOnlineOffline(true);
            }, false);
            $window.addEventListener("offline", function (e) {
                processOnlineOffline(false);
            }, false);
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

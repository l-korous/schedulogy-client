angular.module('Schedulogy')
    .controller('MainCtrl', function ($scope, $rootScope, $ionicModal, Auth, settings, $http, $ionicLoading, $timeout, MyResources, MyUsers, MyEvents, $ionicScrollDelegate) {
        // Some loading time to be sure we are all set.
        $scope.passwordRules = {
            minGroups: settings.minPasswordGroups,
            minLength: settings.minPasswordLength
        };

        $scope.user = {name: $rootScope.currentUser ? $rootScope.currentUser.username : ''};

        // For the calendar menu, we have to find the calendar scope.
        $timeout(function () {
            $scope.calendarScope = angular.element($('#theOnlyCalendar')).scope();
        });

        // Could this be removed?
        $scope.appVersion = settings.appVersion;

        //////////// MODALS ////////////

        // This is filled by the children if this parent needs to use methods of children controllers.
        $scope.modalScope = {};

        // This is definition of child modals of this parent.
        // - All modals can state callbacks of three actions (open, close (~cancel), confirm (~save)).
        $scope.modals =
            {
                users: {
                    closeCallback: function (params) {
                        $scope.successInfo = '';
                        $scope.errorInfo = '';
                    }
                },
                resources: {
                    closeCallback: function () {
                        if ($scope.modalScope.resources.eventRefreshNeeded)
                            MyEvents.refresh();
                    },
                    openCallback: function (params) {
                        $scope.successInfo = '';
                        $scope.errorInfo = '';
                    }
                },
                leftMenu: {
                },
                changeUsername: {
                    confirmCallback: function () {
                        $scope.beingSubmitted = true;
                        $ionicLoading.show({template: settings.loadingTemplate});
                        Auth.changeUsername($scope.user.name).then(function () {
                            $ionicLoading.hide();
                            $scope.closeModal('changeUsername');
                            $scope.currentModal = null;
                        }, function (msg) {
                            $scope.errorInfo = settings.generalErrorInfo(msg);
                        });
                    },
                    openCallback: function (params) {
                        $scope.successInfo = '';
                        $scope.errorInfo = '';
                    }
                },
                changePassword: {
                    confirmCallback: function () {
                        $scope.beingSubmitted = true;
                        $ionicLoading.show({template: settings.loadingTemplate});
                        Auth.changePassword($scope.data.password).then(function () {
                            $ionicLoading.hide();
                            $scope.closeModal('changePassword');
                            $scope.currentModal = null;
                        }, function (msg) {
                            $scope.errorInfo = settings.generalErrorInfo(msg);
                        });
                    },
                    openCallback: function (params) {
                        $scope.data = {
                            password: '',
                            confirmPassword: ''
                        };
                        $scope.successInfo = '';
                        $scope.errorInfo = '';
                    }
                },
                feedback: {
                    confirmCallback: function () {
                        $scope.beingSubmitted = true;
                        $ionicLoading.show({template: settings.loadingTemplate});
                        $http.post(settings.serverUrl + '/msg', {msg: $scope.data.feedbackText})
                            .success(function () {
                                $ionicLoading.hide();
                                $scope.successInfo = settings.feedbackSuccessInfo;
                            })
                            .error(function (errorResponse) {
                                $ionicLoading.hide();
                                $scope.errorInfo = settings.feedbackErrorInfo(errorResponse.msg);
                            });
                    },
                    openCallback: function (params) {
                        $scope.data = {
                            feedbackText: ''
                        };
                        $scope.successInfo = '';
                        $scope.errorInfo = '';
                    }
                }
            };

        // Uniform instantiating of modals.
        for (var modalData in $scope.modals) {
            $ionicModal.fromTemplateUrl('templates/' + modalData + 'Modal.html', {
                scope: $scope,
                // An exception for leftMenu
                animation: modalData === 'leftMenu' ? 'animated fadeInLeft' : 'animated zoomIn'
            }).then(function (modal) {
                // This is a trick - we need to know which modalData we just finished creating the modal for.
                var modalName = $(modal.el).find('.modalNamingSearch').attr('name');
                $scope[modalName + 'Modal'] = modal;
            });
        }

        // Uniform opening of modals.
        $scope.openModal = function (modalName, params) {
            if ($scope.modalScope[modalName] && $scope.modalScope[modalName].init)
                $scope.modalScope[modalName].init();

            // This is ugly hack, should be fixed. What it does:
            // - keyup event 'Esc' won't fire until the modal has focus
            // - modals which have primary inputs (e.g. task modal) will just focus the first input
            // - modals which do not (float to fixed) have a special dummy hidden input for this purpose
            var focusPrimaryInput = function () {
                if (!$rootScope.isMobileLow && !$rootScope.isMobileNarrow) {
                    var primaryInput = $($scope[$scope.currentModal + 'Modal'].modalEl).find('#primaryInput');
                    primaryInput.focus();
                    primaryInput.select();
                }

                $ionicScrollDelegate.scrollTop();
            };

            $scope[modalName + 'Modal'].show().then(function () {
                $scope.currentModal = modalName;
                focusPrimaryInput();
                $scope.modals[modalName].openCallback && $scope.modals[modalName].openCallback(params);
            });
        };

        // Uniform closing of modals.
        $scope.closeModal = function (modalName, callback) {
            $scope[modalName + 'Modal'].hide();
            $scope.modals[modalName].closeCallback && $scope.modals[modalName].closeCallback();
            callback && callback();
            $scope.currentModal = null;
        };

        // Uniform confirming of modals.
        // This does NOT close the modal.
        $scope.confirmModal = function (modalName, callback) {
            $scope.modals[modalName].confirmCallback && $scope.modals[modalName].confirmCallback();
            callback && callback();
        };

        // 'Close' key handler - using the uniform method.
        $scope.$on('Esc', function () {
            for (var modalData in $scope.modals)
                $scope.closeModal(modalData);

            // Also close all popups:
            $timeout(function () {
                $('.button_close').click();
            });
        });
        // 'Confirm' key handler - using the uniform method.
        $scope.$on('Enter', function () {
            for (var modalData in $scope.modals)
                if (modalData === $scope.currentModal)
                    $scope.confirmModal(modalData);
        });
        // Cleanup when destroying.
        $scope.$on('$destroy', function () {
            for (var modalData in $scope.modals)
                $scope[modalData + 'Modal'].remove();
        });
    });

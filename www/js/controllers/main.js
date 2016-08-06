angular.module('Schedulogy')
    .controller('MainCtrl', function ($scope, $rootScope, $ionicPopover, $ionicModal, Auth, settings, $http, $ionicLoading, $timeout) {
        // Some loading time to be sure we are all set.
        $scope.passwordRules = {
            minGroups: settings.minPasswordGroups,
            minLength: settings.minPasswordLength
        };

        $ionicPopover.fromTemplateUrl('templates/user_menu.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.userMenuPopover = popover;
        });
        $scope.openUserMenuPopover = function ($event) {
            $scope.userMenuPopover.show($event);
        };
        $scope.closeUserMenuPopover = function () {
            $scope.userMenuPopover.hide();
        };

        // For the calendar menu, we have to find the calendar scope.
        $timeout(function () {
            $scope.calendarScope = angular.element($('#theOnlyCalendar')).scope();
        });
        $ionicPopover.fromTemplateUrl('templates/calendar_menu.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.calendarMenuPopover = popover;
        });
        $scope.openCalendarMenuPopover = function ($event) {
            $scope.calendarMenuPopover.show($event);
        };
        $scope.closeCalendarMenuPopover = function () {
            $scope.calendarMenuPopover.hide();
        };

        $scope.modal = {};
        ['changeUsername', 'changePassword', 'feedback'].forEach(function (modalName) {
            $ionicModal.fromTemplateUrl('templates/' + modalName + '.html', {
                scope: $scope,
                animation: 'animated zoomIn'
            }).then(function (modal) {
                $scope.modal[modalName] = modal;
                // This is ugly hack, should be fixed.
                $('#primaryInput').focus();
                $('#primaryInput').select();
            });
        });

        $scope.closeModal = function (modalName) {
            $scope.modal[modalName].hide();
        };

        $scope.user = {name: $rootScope.currentUser ? $rootScope.currentUser.username : ''};
        $scope.save = function (modalName) {
            $scope.beingSubmitted = true;
            if (modalName === 'changeUsername') {
                $ionicLoading.show({template: settings.loadingTemplate});
                Auth.changeUsername($scope.user.name).then(function () {
                    $ionicLoading.hide();
                    $scope.closeModal(modalName);
                }, function (msg) {
                    $scope.errorInfo = settings.generalErrorInfo(msg);
                });
            }
            if (modalName === 'changePassword') {
                $ionicLoading.show({template: settings.loadingTemplate});
                Auth.changePassword($scope.data.password).then(function () {
                    $ionicLoading.hide();
                    $scope.closeModal(modalName);
                }, function (msg) {
                    $scope.errorInfo = settings.generalErrorInfo(msg);
                });
            }
            if (modalName === 'feedback') {
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
            }
        };

        $scope.openModal = function (modalName) {
            $scope.data = {
                feedbackText: '',
                password: '',
                confirmPassword: ''
            };

            $scope.closeUserMenuPopover();
            $scope.modal[modalName].show().then(function () {
                if (angular.element($('#primaryInput')).scope()) {
                    angular.element($('#primaryInput')).scope().form.$setPristine();
                }
            });
        };

        $scope.$on('$destroy', function () {
            $scope.userMenuPopover.remove();
            for (var modalData in ['changeUsername', 'changePassword', 'feedback'])
                $scope[modalData + 'Modal'].remove();
        });
    });

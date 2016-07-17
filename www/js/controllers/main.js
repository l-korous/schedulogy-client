angular.module('Schedulogy')
    .controller('MainCtrl', function ($scope, $rootScope, $ionicPopover, $ionicModal, Auth, settings) {
        // Popover
        $ionicPopover.fromTemplateUrl('templates/popovers/user_menu.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });
        $scope.openPopover = function ($event) {
            $scope.popover.show($event);
        };
        $scope.closePopover = function () {
            $scope.popover.hide();
        };
        $scope.$on('$destroy', function () {
            $scope.popover.remove();
        });
        $scope.modal = {};
        ['changeUsername', 'changePassword', 'sendFeedback', 'share'].forEach(function (modalName) {
            $ionicModal.fromTemplateUrl('templates/popovers/' + modalName + '.html', {
                scope: $scope,
                animation: 'animated zoomIn'
            }).then(function (modal) {
                $scope.modal[modalName] = modal;
                // This is ugly hack, should be fixed.
                $('#mainEdit').focus();
                $('#mainEdit').select();
            });
        });

        $scope.keyUpHandler = function (keyCode, formInvalid, modalName) {
            if (keyCode === 13 && !formInvalid) {
                $scope.closeModal(modalName);
                $scope.save(modalName);
            }
            if (keyCode === 27)
                $scope.closeModal(modalName);
        };

        $scope.closeModal = function (modalName) {
            $scope.modal[modalName].hide();
        };

        $scope.user = {name: $rootScope.currentUser.username};
        $scope.save = function (modalName) {
            $scope.beingSubmitted = true;
            if (modalName === 'changeUsername') {
                Auth.changeUsername($scope.user.name).then(function () {
                    $scope.closeModal(modalName);
                }, function (msg) {
                    $scope.errorInfo = settings.generalErrorInfo(msg);
                });
            }
            if (modalName === 'changePassword') {
                Auth.changePassword($scope.password).then(function () {
                    $scope.closeModal(modalName);
                }, function (msg) {
                    $scope.errorInfo = settings.generalErrorInfo(msg);
                });
            }
        };

        $scope.openModal = function (modalName) {
            $scope.closePopover();

            if (angular.element($('#mainEdit')).scope())
                angular.element($('#mainEdit')).scope().form.$setPristine();

            $scope.modal[modalName].show();
        };
    });

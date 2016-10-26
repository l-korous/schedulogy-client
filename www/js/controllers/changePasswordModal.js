angular.module('Schedulogy')
    .controller('ChangePasswordModalCtrl', function ($scope, settings, Auth, ModalService, $rootScope) {
        // Some loading time to be sure we are all set.
        $scope.passwordRules = {
            minGroups: settings.minPasswordGroups,
            minLength: settings.minPasswordLength
        };

        $scope.open = function () {
            $scope.data = {
                password: '',
                confirmPassword: ''
            };

            $scope.successInfo = '';
            $scope.errorInfo = '';
            
            ModalService.openModalInternal('changePassword', function () {
                var primaryInput = $(ModalService.modals.changePassword.modalInternal.modalEl).find('#changePasswordPrimaryInput');
                primaryInput.focus();
                primaryInput.select();
            });
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('changePassword', $scope, $scope.open, $scope.close);

        $scope.save = function () {
            $scope.beingSubmitted = true;
            if ($scope.form.$invalid)
                return;
            $rootScope.isLoading = true;
            Auth.changePassword($scope.data.password).then(function () {
                $rootScope.isLoading = false;
                ModalService.closeModalInternal();
            }, function (msg) {
                $scope.errorInfo = settings.generalErrorInfo(msg);
            });
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'changePassword')
                $scope.close();
        });

        $scope.$on('Enter', function () {
            if (ModalService.currentModal === 'changePassword')
                $scope.save();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['changePassword'].modal.remove();
        });
    });
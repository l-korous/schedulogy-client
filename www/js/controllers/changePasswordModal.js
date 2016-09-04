angular.module('Schedulogy')
    .controller('ChangePasswordModalCtrl', function ($scope, settings, $ionicLoading, Auth, ModalService) {
        ModalService.createModal('changePassword', $scope, {}, $scope.open, $scope.close);

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
            ModalService.openModalInternal('changePassword');
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        $scope.save = function () {
            if ($scope.form.$invalid)
                return;
            $scope.beingSubmitted = true;
            $ionicLoading.show({template: settings.loadingTemplate});
            Auth.changePassword($scope.data.password).then(function () {
                $ionicLoading.hide();
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
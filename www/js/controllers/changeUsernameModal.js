angular.module('Schedulogy')
    .controller('ChangeUsernameModalCtrl', function ($scope, settings, Auth, ModalService, $rootScope) {
        $scope.user = {name: $rootScope.currentUser ? $rootScope.currentUser.username : ''};

        $scope.open = function () {
            ModalService.openModalInternal('changeUsername', function () {
                var primaryInput = $(ModalService.modals.changeUsername.modalInternal.modalEl).find('#changeUsernamePrimaryInput');
                primaryInput.focus();
                primaryInput.select();
            });
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('changeUsername', $scope, $scope.open, $scope.close);

        $scope.save = function () {
            $scope.beingSubmitted = true;
            if ($scope.form.$invalid)
                return;
            $rootScope.isLoading = true;
            Auth.changeUsername($scope.user.name).then(function () {
                $rootScope.isLoading = false;
                ModalService.closeModalInternal();
            }, function (msg) {
                $scope.errorInfo = settings.generalErrorInfo(msg);
            });
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'changeUsername')
                $scope.close();
        });

        $scope.$on('Enter', function () {
            if (ModalService.currentModal === 'changeUsername')
                $scope.save();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['changeUsername'].modal.remove();
        });
    });

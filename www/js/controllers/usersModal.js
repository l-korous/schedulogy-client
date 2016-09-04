angular.module('Schedulogy')
    .controller('UsersModalCtrl', function (MyUsers, $scope, ModalService) {
        $scope.myUsers = MyUsers;
        $scope.modalService = ModalService;
        $scope.successInfo = null;
        $scope.loading = true;

        ModalService.createModal('users', $scope, {}, $scope.open, $scope.close);

        $scope.open = function () {
            $scope.loading = true;
            $scope.myUsers.refresh(function () {
                $scope.loading = false;
            });

            ModalService.openModalInternal('users');
        };

        $scope.close = function () {
            ModalService.closeModalInternal(function () {
                $scope.successInfo = '';
                $scope.errorInfo = '';
            });
        };

        $scope.$on('Esc', function () {
            if(ModalService.currentModal === 'users')
                $scope.close();
        });
        
        $scope.$on('$destroy', function () {
            ModalService.modals.users.modal.remove();
        });
    });

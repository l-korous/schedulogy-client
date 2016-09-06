angular.module('Schedulogy')
    .controller('UsersModalCtrl', function (MyUsers, $scope, ModalService, MyEvents, MyResources) {
        $scope.myUsers = MyUsers;
        $scope.successInfo = null;
        $scope.loading = true;

        $scope.open = function () {
            $scope.successInfo = '';
            $scope.errorInfo = '';
            $scope.loading = true;
            $scope.myUsers.refresh(function () {
                $scope.loading = false;
            });

            ModalService.openModalInternal('users');
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('users', $scope, $scope.open, $scope.close);

        $scope.remove = function (user) {
            $scope.myUsers.removeUser(user, function () {
                MyResources.refresh();
                MyEvents.refresh();
            });
        };

        $scope.openDetail = function (user) {
            if (user)
                MyUsers.currentUser = user;
            else
                MyUsers.emptyCurrentUser();
            ModalService.openModal('user');
        };

        $scope.openRemoveDetail = function (user) {
            MyResources.currentResource = MyResources.getResourceByUserId(user._id);
            ModalService.openModal('removeResource');
        };
        
        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'users')
                $scope.close();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals.users.modal.remove();
        });
    });

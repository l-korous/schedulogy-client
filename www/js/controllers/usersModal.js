angular.module('Schedulogy')
    .controller('UsersModalCtrl', function (MyUsers, $scope, ModalService, MyItems, MyResources, $rootScope) {
        $scope.myUsers = MyUsers;
        $scope.successInfo = null;

        $scope.open = function () {
            $rootScope.isLoading = true;
            $scope.successInfo = '';
            $scope.errorInfo = '';
            $scope.myUsers.refresh(function () {
                $rootScope.isLoading = false;
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
                MyItems.refresh();
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
            ModalService.modals.removeResource.scope.setAssociatedUser(user);
        };
        
        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'users')
                $scope.close();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals.users.modal.remove();
        });
    });

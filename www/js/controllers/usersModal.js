angular.module('Schedulogy')
    .controller('UsersModalCtrl', function (MyUsers, $scope, ModalService, MyItems, MyResources, $rootScope) {
        $scope.myUsers = MyUsers;
        $scope.successInfo = null;

        $scope.open = function () {
            $scope.successInfo = '';
            $scope.errorInfo = '';
            $scope.myUsers.refresh();
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

        $scope.openInvitationDetail = function () {
            ModalService.openModal('invitation');
        };

        $scope.openSwitchTenantDetail = function () {
            ModalService.openModal('switchTenant');
        };

        $scope.openResetTenantDetail = function () {
            ModalService.openModal('resetTenant');
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

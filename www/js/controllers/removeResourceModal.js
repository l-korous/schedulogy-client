angular.module('Schedulogy')
    .controller('RemoveResourceModalCtrl', function (MyResources, $scope, settings, ModalService, MyItems, MyUsers) {
        $scope.myResources = MyResources;
        $scope.currentResource = null;
        // This is for the case when we are actually deleting a user.
        $scope.associatedUser = null;

        $scope.open = function () {
            if (!$scope.myResources.currentResource) {
                $scope.myResources.emptyCurrentResource();
                $scope.newResource = true;
            }

            $scope.currentResource = angular.extend({}, $scope.myResources.currentResource);

            ModalService.openModalInternal('removeResource');

            $scope.associatedUser = null;
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('removeResource', $scope, $scope.open, $scope.close);

        // This is for the case when we are actually deleting a user.
        // Should be called AFTER open().
        $scope.setAssociatedUser = function (user) {
            $scope.associatedUser = user;
        };

        $scope.removeResource = function (resourceToReplaceCurrentWith) {
            $scope.myResources.removeResource($scope.currentResource, resourceToReplaceCurrentWith, function () {
                $scope.associatedUser && MyUsers.removeUser($scope.associatedUser);

                ModalService.closeModalInternal();
                MyItems.refresh();
                $scope.resourceToReplaceCurrentWith = null;
            });
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'removeResource')
                $scope.close();
        });

        $scope.$on('Enter', function () {
            if (ModalService.currentModal === 'removeResource')
                $scope.save();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals.resource.modal.remove();
        });
    });

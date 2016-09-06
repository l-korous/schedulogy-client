angular.module('Schedulogy')
    .controller('RemoveResourceModalCtrl', function (MyResources, $scope, settings, ModalService, MyEvents) {
        $scope.myResources = MyResources;
        $scope.currentResource = null;

        $scope.open = function () {
            if (!$scope.myResources.currentResource) {
                $scope.myResources.emptyCurrentResource();
                $scope.newResource = true;
            }

            $scope.currentResource = angular.extend({}, $scope.myResources.currentResource);

            ModalService.openModalInternal('removeResource');
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('removeResource', $scope, $scope.open, $scope.close);

        $scope.removeResource = function (resourceToReplaceCurrentWith) {
            $scope.myResources.removeResource(resourceToReplaceCurrentWith, function () {
                ModalService.closeModalInternal(function () {
                    MyEvents.refresh();
                    $scope.resourceToReplaceCurrentWith = null;
                });
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

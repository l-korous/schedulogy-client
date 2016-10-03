angular.module('Schedulogy')
    .controller('ResourcesModalCtrl', function (MyResources, $scope, ModalService, $rootScope) {
        $scope.myResources = MyResources;
        
        $scope.open = function () {
            $rootScope.isLoading = true;
            $scope.successInfo = '';
            $scope.errorInfo = '';
            $scope.myResources.refresh(function () {
                $rootScope.isLoading = false;
            });

            ModalService.openModalInternal('resources');
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('resources', $scope, $scope.open, $scope.close);

        $scope.openDetail = function (resource) {
            if (resource)
                MyResources.currentResource = resource;
            else
                MyResources.emptyCurrentResource();
            ModalService.openModal('resource');
        };
        
        $scope.openRemoveDetail = function (resource) {
            MyResources.currentResource = resource;
            ModalService.openModal('removeResource');
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'resources')
                $scope.close();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals.resources.modal.remove();
        });
    });

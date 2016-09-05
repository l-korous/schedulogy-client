angular.module('Schedulogy')
    .controller('ResourcesModalCtrl', function (MyResources, $scope, $ionicModal, ModalService) {
        $scope.myResources = MyResources;
        $scope.modalService = ModalService;
        $scope.loading = true;

        $scope.open = function () {
            $scope.loading = true;
            $scope.successInfo = '';
            $scope.errorInfo = '';
            $scope.myResources.refresh(function () {
                $scope.loading = false;
            });

            ModalService.openModalInternal('resources');
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('resources', $scope, $scope.open, $scope.close);

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'resources')
                $scope.close();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals.resources.modal.remove();
        });
    });

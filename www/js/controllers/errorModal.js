angular.module('Schedulogy')
    .controller('ErrorModalCtrl', function (ModalService, $scope) {
        $scope.modalService = ModalService;

        $scope.open = function () {
            ModalService.openModalInternal('error');
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('error', $scope, $scope.open, $scope.close);

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'error')
                $scope.close();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['error'].modal.remove();
        });
    });

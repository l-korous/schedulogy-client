angular.module('Schedulogy')
    .controller('ErrorModalCtrl', function (ModalService, $scope) {
        ModalService.createModal('error', $scope, {}, $scope.open, $scope.close);

        $scope.open = function () {
            ModalService.openModalInternal('error');
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'error')
                $scope.close();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['error'].modal.remove();
        });
    });

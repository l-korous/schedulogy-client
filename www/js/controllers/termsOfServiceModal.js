angular.module('Schedulogy')
    .controller('TermsOfServiceModalCtrl', function ($scope, settings, $sce, ModalService) {
        $scope.open = function () {
            ModalService.openModalInternal('termsOfService');
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('termsOfService', $scope, $scope.open, $scope.close);

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'termsOfService')
                $scope.close();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['termsOfService'].modal.remove();
        });
    });

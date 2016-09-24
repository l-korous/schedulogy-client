angular.module('Schedulogy')
    .controller('PrivacyPolicyModalCtrl', function ($scope, settings, $sce, ModalService) {
        $scope.open = function () {
            ModalService.openModalInternal('privacyPolicy');
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('privacyPolicy', $scope, $scope.open, $scope.close);

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'privacyPolicy')
                $scope.close();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['privacyPolicy'].modal.remove();
        });
    });

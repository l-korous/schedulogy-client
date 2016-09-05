angular.module('Schedulogy')
    .controller('RemoveAllModalCtrl', function ($scope, MyEvents, ModalService) {
        $scope.open = function () {
            ModalService.openModalInternal('removeAll');
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('removeAll', $scope, $scope.open, $scope.close);

        $scope.save = function () {
            MyEvents.deleteAll(function () {
                ModalService.closeModalInternal();
            });
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'removeAll')
                $scope.close();
        });

        $scope.$on('Enter', function () {
            if (ModalService.currentModal === 'removeAll')
                $scope.save();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['removeAll'].modal.remove();
        });
    });

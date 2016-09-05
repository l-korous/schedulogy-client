angular.module('Schedulogy')
    .controller('LeftMenuModalCtrl', function (ModalService, MyEvents, $scope, Hopscotch) {
        $scope.modalService = ModalService;
        $scope.myEvents = MyEvents;

        $scope.open = function () {
            ModalService.openModalInternal('leftMenu');
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('leftMenu', $scope, $scope.open, $scope.close);

        $scope.save = function () {
            MyEvents.deleteAll();
            ModalService.closeModalInternal();
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'leftMenu')
                $scope.close();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['leftMenu'].modal.remove();
        });

        $scope.runTour = function () {
            Hopscotch.runTour(0);
        };
    });

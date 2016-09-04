angular.module('Schedulogy')
    .controller('LeftMenuModalCtrl', function (ModalService, MyEvents, $scope, Hopscotch) {
        $scope.modalService = ModalService;
        $scope.myEvents = MyEvents;

        ModalService.createModal('leftMenu', $scope, {animation: 'animated fadeInLeft'}, $scope.open, $scope.close);

        $scope.open = function () {
            ModalService.openModalInternal('leftMenu');
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

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

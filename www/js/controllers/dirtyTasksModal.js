angular.module('Schedulogy')
    .controller('DirtyTasksModalCtrl', function ($scope, MyEvents, ModalService) {
        $scope.myEvents = MyEvents;
        $scope.modalService = ModalService;
        ModalService.createModal('dirtyTasks', $scope, {}, $scope.open, $scope.close);

        $scope.open = function () {
            ModalService.openModalInternal('dirtyTasks');
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        $scope.deleteEvent = function (event, jsEvent) {
            $scope.myEvents.deleteEventById(event._id);
            jsEvent.stopPropagation();
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'dirtyTasks')
                $scope.close();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['dirtyTasks'].modal.remove();
        });
    });

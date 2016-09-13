angular.module('Schedulogy')
    .controller('FloatToFixedModalCtrl', function ($scope, settings, MyEvents, ModalService) {
        $scope.myEvents = MyEvents;

        $scope.open = function () {
            ModalService.openModalInternal('floatToFixed');
        };

        $scope.setFloatToFixedData = function (data) {
            $scope.floatToFixedDelta = data.floatToFixedDelta;
            $scope.floatToFixedEvent = data.floatToFixedEvent;
            $scope.floatToFixedMethod = data.floatToFixedMethod;
            $scope.floatToFixedRevertFunc = data.floatToFixedRevertFunc;
        };

        $scope.close = function () {
            $scope.floatToFixedRevertFunc && $scope.floatToFixedRevertFunc();
            ModalService.closeModalInternal();
        };

        ModalService.initModal('floatToFixed', $scope, $scope.open, $scope.close);

        $scope.save = function () {
            MyEvents.currentEvent = $scope.floatToFixedEvent;
            MyEvents.currentEvent.type = 'fixed';
            if ($scope.floatToFixedMethod === 'resize') {
                MyEvents.processChangeOfEventType(MyEvents.currentEvent, 'floating');
                MyEvents.currentEvent.dur += ($scope.floatToFixedDelta.minutes() / settings.minuteGranularity);
                MyEvents.imposeEventDurationBound();
                MyEvents.processEventDuration();
                MyEvents.recalcEventConstraints();
                if (!MyEvents.recalcEventConstraints()) {
                    MyEvents.currentEvent.error = 'Impossible to schedule due to constraints';
                    return;
                }
            }
            else if ($scope.floatToFixedMethod === 'drop') {
                MyEvents.processChangeOfEventType(MyEvents.currentEvent, 'floating');
                MyEvents.processEventDuration();
                if (!MyEvents.recalcEventConstraints()) {
                    MyEvents.currentEvent.error = 'Impossible to schedule due to constraints';
                    return;
                }
            }
            MyEvents.saveEvent();
            ModalService.closeModalInternal();
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'floatToFixed')
                $scope.close();
        });

        $scope.$on('Enter', function () {
            if (ModalService.currentModal === 'floatToFixed')
                $scope.save();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['floatToFixed'].modal.remove();
        });
    });

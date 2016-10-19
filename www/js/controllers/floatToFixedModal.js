angular.module('Schedulogy')
    .controller('FloatToFixedModalCtrl', function ($scope, settings, MyItems, ModalService) {
        $scope.myItems = MyItems;

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
            MyItems.currentItem = $scope.floatToFixedEvent;
            MyItems.currentItem.type = 'event';
            if ($scope.floatToFixedMethod === 'resize') {
                MyItems.processChangeOfEventType(MyItems.currentItem, 'task');
                MyItems.currentItem.dur += ($scope.floatToFixedDelta.minutes() / settings.minuteGranularity);
                MyItems.imposeEventDurationBound();
                MyItems.processEventDuration();
                MyItems.recalcEventConstraints();
                if (!MyItems.recalcEventConstraints()) {
                    MyItems.currentItem.error = 'Impossible to schedule due to constraints';
                    return;
                }
            }
            else if ($scope.floatToFixedMethod === 'drop') {
                MyItems.processChangeOfEventType(MyItems.currentItem, 'task');
                MyItems.processEventDuration();
                if (!MyItems.recalcEventConstraints()) {
                    MyItems.currentItem.error = 'Impossible to schedule due to constraints';
                    return;
                }
            }
            MyItems.saveItem();
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

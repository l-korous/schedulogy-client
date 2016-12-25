angular.module('Schedulogy')
    .controller('TaskModalCtrl', function (DateUtils, $scope, settings, MyItems, Item, moment, ionicDatePicker, ionicTimePicker, Notification, $timeout, MyResources, ModalService, $ionicScrollDelegate, lodash) {
        $scope.myItems = MyItems;
        $scope.myResources = MyResources;
        $scope.popupOpen = false;
        $scope.currentItem = null;
        $scope.cachedDurValue = [0, 0];

        $scope.open = function () {
            $scope.myResources.refresh();

            $scope.currentItem = angular.extend({}, MyItems.currentItem);

            $scope.form.$setPristine();

            $scope.cachedDurValue = [0, 0];

            ModalService.openModalInternal('task', function () {
                $ionicScrollDelegate.scrollTop();
                var primaryInput = $(ModalService.modals.task.modalInternal.modalEl).find('#taskPrimaryInput');
                primaryInput.focus();
                primaryInput.select();

                $(function () {
                    $('#taskModalTextarea').autogrow();
                });
            });
        };

        $scope.switchAllDay = function () {
            // This is reverted, we are inserting the 'old' value.s
            $scope.cachedDurValue[$scope.currentItem.allDay ? 0 : 1] = $scope.currentItem.dur;
            if ($scope.cachedDurValue[$scope.currentItem.allDay ? 1 : 0])
                $scope.currentItem.dur = $scope.cachedDurValue[$scope.currentItem.allDay ? 1 : 0];
            else
                $scope.currentItem.dur = settings.defaultTaskDuration[$scope.currentItem.allDay ? 1 : 0];
            $scope.myItems.processEventDuration($scope.currentItem);
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('task', $scope, $scope.open, $scope.close);

        $scope.save = function () {
            $scope.myItems.saveItem($scope.currentItem, function () {
                ModalService.closeModalInternal('task');
            }, function () {
                ModalService.closeModalInternal('task');
            });
        };

        $scope.processEventDuration = function () {
            if (!$scope.myItems.recalcEventConstraints($scope.currentItem))
                $scope.currentItem.error = 'Impossible to schedule due to constraints';
        };

        $scope.renderEventDuration = function () {
            $scope.myItems.processEventDuration($scope.currentItem);
        };

        $scope.remove = function () {
            $scope.myItems.deleteItemById($scope.myItems.currentItem._id, function () {
                ModalService.closeModalInternal('task');
            }, function () {
                ModalService.closeModalInternal('task');
            });
        };

        $scope.commonFilter = function (inspectedEvent) {
            if (inspectedEvent.type === 'reminder')
                return false;
            if ($scope.currentItem && (inspectedEvent._id === $scope.currentItem._id))
                return false;
            var retVal = true;
            if ($scope.currentItem && ($scope.currentItem.blocks || $scope.currentItem.needs)) {
                $scope.currentItem.blocks && $scope.currentItem.blocks.forEach(function (other) {
                    if (other === inspectedEvent._id)
                        retVal = false;
                });
                $scope.currentItem.needs && $scope.currentItem.needs.forEach(function (other) {
                    if (other === inspectedEvent._id)
                        retVal = false;
                });
            }
            return retVal;
        };

        $scope.blocksFilter = function (inspectedEvent) {
            if (inspectedEvent.type !== 'task')
                return false;
            if (!$scope.commonFilter(inspectedEvent))
                return false;
            if ($scope.currentItem && $scope.currentItem.constraint.start && inspectedEvent.constraint.end) {
                var latestPossibleStartOfInspectedEvent = Item.latestPossibleStart(inspectedEvent);
                var earliestPossibleFinishOfCurrentEvent = Item.earliestPossibleFinish($scope.currentItem);
                if (earliestPossibleFinishOfCurrentEvent.diff(latestPossibleStartOfInspectedEvent, 'm') > 0)
                    return false;
            }
            return true;
        };

        $scope.needsFilter = function (inspectedEvent) {
            if (!$scope.commonFilter(inspectedEvent))
                return false;
            if ($scope.currentItem && inspectedEvent.constraint.start && $scope.currentItem.constraint.end) {
                var latestPossibleStartOfCurrentEvent = Item.latestPossibleStart($scope.currentItem);
                var earliestPossibleFinishOfInspectedEvent = Item.earliestPossibleFinish(inspectedEvent);
                if (latestPossibleStartOfCurrentEvent.diff(earliestPossibleFinishOfInspectedEvent, 'm') < 0)
                    return false;
            }
            return true;
        };

        $scope.startValueForOrderingOfDependencies = function (event) {
            return event.start.unix();
        };

        // Date & time picker
        $scope.datePicker = {
            callback: function (val) {
                $scope.currentItem.due = DateUtils.pushDatePart(moment(val), $scope.currentItem.due);
                Item.setDue($scope.currentItem);

                if (!MyItems.recalcEventConstraints($scope.currentItem))
                    $scope.currentItem.error = 'Impossible to schedule due to constraints';

                $scope.form.$setDirty();
            }
        };
        $scope.timePicker = {
            callback: function (val) {
                $scope.currentItem.due = DateUtils.pushTime(val, $scope.currentItem.due);
                Item.setDue($scope.currentItem);
                
                if (!MyItems.recalcEventConstraints($scope.currentItem))
                    $scope.currentItem.error = 'Impossible to schedule due to constraints';

                $scope.form.$setDirty();
            }
        };

        $scope.openDatePicker = function () {
            $scope.popupOpen = true;

            $scope.datePicker.inputDate = $scope.currentItem ? $scope.currentItem.due.toDate() : MyItems.getBTime();
            if ($scope.currentItem.constraint.start)
                $scope.datePicker.from = $scope.currentItem.constraint.start.toDate();
            if ($scope.currentItem.constraint.end)
                $scope.datePicker.to = $scope.currentItem.constraint.end.toDate();

            ionicDatePicker.openDatePicker($scope.datePicker);
        };
        $scope.openTimePicker = function () {
            $scope.popupOpen = true;
            $scope.timePicker.inputTime = $scope.currentItem ? (DateUtils.toMinutes($scope.currentItem.due) * 60) : MyItems.getBTime();

            var dueDateEqualsStartConstraint =
                $scope.currentItem.constraint.start ? DateUtils.equalDays($scope.currentItem.due, $scope.currentItem.constraint.startDue) : false;

            var dueDateEqualsEndConstraint =
                $scope.currentItem.constraint.end ? DateUtils.equalDays($scope.currentItem.due, $scope.currentItem.constraint.end) : false;

            $scope.timePicker.constraint = {
                from: dueDateEqualsStartConstraint ? (DateUtils.toMinutes($scope.currentItem.constraint.startDue)) : settings.startHour * 60,
                to: dueDateEqualsEndConstraint ? DateUtils.toMinutes($scope.currentItem.constraint.end) : settings.endHour * 60
            };
            ionicTimePicker.openTimePicker($scope.timePicker);
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'task') {
                if ($scope.popupOpen) {
                    $timeout(function () {
                        $('.button_close').click();
                    });
                    $scope.popupOpen = false;
                }
                else {
                    $scope.close();
                }
            }
        });

        $scope.$on('$destroy', function () {
            ModalService.modals.task.modal.remove();
        });
    });

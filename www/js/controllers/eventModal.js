angular.module('Schedulogy')
    .controller('EventModalCtrl', function (DateUtils, $scope, constants, MyItems, Item, moment, ionicDatePicker, ionicTimePicker, Notification, $timeout, MyResources, ModalService, $ionicScrollDelegate, lodash) {
        $scope.myItems = MyItems;
        $scope.myResources = MyResources;
        $scope.popupOpen = null;
        $scope.currentItem = null;
        $scope.cachedDurValue = [0, 0];
        $scope.data = {
            showRepetition: false,
            showCustomNotifications: false,
            newNotification: {
                amount: 1,
                timeUnit: 'hours'
            },
            storedPreviousNotificationAmount: 1
        };

        $scope.open = function () {
            $scope.myResources.refresh();

            $scope.currentItem = angular.extend({}, MyItems.currentItem);

            $scope.data.showRepetition = !(!($scope.currentItem.repetition));

            $scope.data.showCustomNotifications = ($scope.currentItem.notifications.length > 0);

            $scope.data.newNotification = {
                amount: 1,
                timeUnit: 'hours'
            };
            $scope.data.storedPreviousNotificationAmount = 1;

            $scope.form.$setPristine();

            $scope.cachedDurValue = [0, 0];

            ModalService.openModalInternal('event', function () {
                $ionicScrollDelegate.scrollTop();
                var primaryInput = $(ModalService.modals.event.modalInternal.modalEl).find('#eventPrimaryInput');
                primaryInput.focus();
                primaryInput.select();

                $(function () {
                    $('#eventModalTextarea').autogrow();
                });
            });
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('event', $scope, $scope.open, $scope.close);

        $scope.save = function () {
            $scope.myItems.processSaveRequest($scope.currentItem, function () {
                ModalService.closeModalInternal('event');
            }, function () {
                ModalService.closeModalInternal('event');
            });
        };

        $scope.switchAllDay = function () {
            // This is reverted, we are inserting the 'old' value.
            $scope.cachedDurValue[$scope.currentItem.allDay ? 0 : 1] = $scope.currentItem.dur;
            if ($scope.cachedDurValue[$scope.currentItem.allDay ? 1 : 0])
                $scope.currentItem.dur = $scope.cachedDurValue[$scope.currentItem.allDay ? 1 : 0];
            else
                $scope.currentItem.dur = constants.defaultTaskDuration[$scope.currentItem.allDay ? 1 : 0];
            $scope.myItems.processEventDuration($scope.currentItem);
        };

        $scope.processNotificationAmountChange = function () {
            var resetToPrevious = false;
            if (isNaN($scope.data.newNotification.amount))
                resetToPrevious = true;
            else {
                if ($scope.data.newNotification.amount > 999)
                    resetToPrevious = true;
            }
            if (resetToPrevious)
                $scope.data.newNotification.amount = $scope.data.storedPreviousNotificationAmount;
            else
                $scope.data.storedPreviousNotificationAmount = $scope.data.newNotification.amount;
        };

        $scope.addNotification = function () {
            $scope.currentItem.notifications.push(angular.extend({}, $scope.data.newNotification));
        };

        $scope.removeNotification = function (index) {
            $scope.currentItem.notifications.splice(index, 1);
        };

        $scope.switchCustomNotifications = function () {
            $scope.currentItem.notifications = [];
        };

        $scope.processEventDuration = function () {
            if (!$scope.myItems.recalcEventConstraints($scope.currentItem))
                $scope.currentItem.error = 'Impossible to schedule due to constraints';
        };

        $scope.renderEventDuration = function () {
            $scope.myItems.processEventDuration($scope.currentItem);
        };

        $scope.remove = function () {
            $scope.myItems.processDeleteRequest($scope.myItems.currentItem._id, function () {
                ModalService.closeModalInternal('event');
            }, function () {
                ModalService.closeModalInternal('event');
            });
        };

        $scope.commonFilter = function (inspectedEvent) {
            if ($scope.currentItem && inspectedEvent._id === $scope.currentItem._id)
                return false;
            var retVal = true;
            if ($scope.currentItem && $scope.currentItem.blocks) {
                $scope.currentItem.blocks && $scope.currentItem.blocks.forEach(function (other) {
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

        $scope.startValueForOrderingOfDependencies = function (event) {
            return event.start.unix();
        };

        $scope.switchRepetition = function () {
            if ($scope.currentItem.repetition)
                $scope.currentItem.repetition = null;
            else {
                $scope.currentItem.repetition = constants.defaultRepetition(MyItems.getBTime().clone());
                Item.setRepetitionEnd($scope.currentItem);
            }
        };

        $scope.datePicker = {
            start: {
                callback: function (val) {
                    $scope.currentItem.start = DateUtils.pushDatePart(moment(val), $scope.currentItem.start);
                    Item.setStart($scope.currentItem);
                    MyItems.processEventDuration($scope.currentItem);

                    if (!MyItems.recalcEventConstraints($scope.currentItem))
                        $scope.currentItem.error = 'Impossible to schedule due to constraints';

                    $scope.form.$setDirty();
                    $scope.popupOpen = null;
                },
                closeCallback: function () {
                    $scope.popupOpen = null;
                }
            },
            repetitionEnd: {
                callback: function (val) {
                    $scope.currentItem.repetition.end = DateUtils.pushDatePart(moment(val), $scope.currentItem.repetition.end);
                    Item.setRepetitionEnd($scope.currentItem);
                    $scope.form.endDate.$setDirty();
                    $scope.popupOpen = null;
                },
                closeCallback: function () {
                    $scope.popupOpen = null;
                }
            }
        };

        $scope.openDatePicker = function (which) {
            $scope.popupOpen = 'date';

            if (which === 'start') {
                $scope.datePicker.start.inputDate = $scope.currentItem ? $scope.currentItem.start.toDate() : MyItems.getBTime();
                if ($scope.currentItem.constraint.start)
                    $scope.datePicker.start.from = $scope.currentItem.constraint.start.toDate();
                if ($scope.currentItem.constraint.end)
                    $scope.datePicker.start.to = $scope.currentItem.constraint.end.toDate();
            }
            if (which === 'repetitionEnd')
                $scope.datePicker.repetitionEnd.inputDate = $scope.currentItem ? $scope.currentItem.repetition.end.toDate() : MyItems.getBTime().clone().add(constants.defaultMonthsUntil, 'months');

            ionicDatePicker.openDatePicker($scope.datePicker[which]);
        };

        $scope.timePicker = {
            callback: function (val) {
                $scope.currentItem.start = DateUtils.pushTime(val, $scope.currentItem.start);
                $scope.currentItem.startTimeText = $scope.currentItem.start.format(constants.timeFormat);
                MyItems.processEventDuration($scope.currentItem);

                $scope.form.$setDirty();
                $scope.popupOpen = null;
            },
            closeCallback: function () {
                $scope.popupOpen = null;
            }
        };

        $scope.openTimePicker = function () {
            $scope.popupOpen = 'time';

            $scope.timePicker.inputTime = $scope.currentItem ? (DateUtils.toMinutes($scope.currentItem.start) * 60) : MyItems.getBTime();

            // here the event type is fixed, because allDay events do not have timePicker shown.
            // This is for the 'start' time picker.
            var startDateEqualsStartConstraint =
                $scope.currentItem.constraint.start ? DateUtils.equalDays($scope.currentItem.start, $scope.currentItem.constraint.start) : false;

            var startDateEqualsEndConstraint =
                $scope.currentItem.constraint.end ? DateUtils.equalDays($scope.currentItem.start, $scope.currentItem.constraint.end) : false;

            $scope.timePicker.constraint = {
                from: startDateEqualsStartConstraint ? (DateUtils.toMinutes($scope.currentItem.constraint.start)) : 0,
                to: startDateEqualsEndConstraint ? DateUtils.toMinutes($scope.currentItem.constraint.end) : 24 * 60
            };

            ionicTimePicker.openTimePicker($scope.timePicker);
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'event') {
                if ($scope.popupOpen) {
                    $timeout(function () {
                        $('.button_close').click();
                    });
                } else {
                    $scope.close();
                }
            }
        });

        $scope.$on('Enter', function () {
            if (ModalService.currentModal === 'event') {
                if ($scope.popupOpen === 'time') {
                    $timeout(function () {
                        $('.button_set').click();
                    });
                } else if (!$scope.popupOpen) {
                    $scope.save();
                }
            }
        });

        $scope.$on('$destroy', function () {
            ModalService.modals.event.modal.remove();
        });
    });

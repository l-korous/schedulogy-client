angular.module('Schedulogy')
    .controller('TaskModalCtrl', function (DateUtils, $scope, constants, MyItems, Item, moment, Notification, $timeout, MyResources, ModalService, $ionicScrollDelegate, $rootScope) {
        $scope.myItems = MyItems;
        $scope.myResources = MyResources;
        $scope.popupOpen = null;
        $scope.currentItem = null;
        $scope.cachedDurValue = [0, 0];
        $scope.data = {
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

            $scope.recalculateDeps();
            $scope.recalculatePreqs();

            $scope.form.$setPristine();

            $scope.cachedDurValue = [0, 0];

            $scope.data.showCustomNotifications = ($scope.currentItem.notifications.length > 0);

            $scope.data.newNotification = {
                amount: 1,
                timeUnit: 'hours'
            };
            $scope.data.storedPreviousNotificationAmount = 1;

            ModalService.openModalInternal('task', function () {
                $ionicScrollDelegate.scrollTop();
                var primaryInput = $(ModalService.modals.task.modalInternal.modalEl).find('#taskPrimaryInput');
                primaryInput.focus();
                primaryInput.select();

                $(function () {
                    $('#taskModalTextarea').autogrow();
                    if (!$rootScope.canDoDateTimeInputs) {
                        $("#taskDueDate").datepicker({
                            onClose: function (dateText, inst) {
                                $scope.currentItem.dueDate = dateText;
                                $scope.processDueDateChange();
                            },
                            minDate: $scope.currentItem.constraint.startDue ? $scope.currentItem.constraint.startDue.format('MM/DD/YYYY') : null,
                            maxDate: $scope.currentItem.constraint.endDue ? $scope.currentItem.constraint.endDue.format('MM/DD/YYYY') : null
                        });

                        $("#taskDueTime").on('change', function () {
                            $scope.currentItem.dueTime = $('#taskDueTime')[0].value;
                            $scope.processDueDateChange();
                        });

                        $("#taskDueTime").timepicker({
                            timeFormat: 'H:i',
                            minTime: $scope.currentItem.constraint.startDueTime,
                            maxTime: $scope.currentItem.constraint.endDueTime
                        });
                    }
                });
            });
        };

        $scope.switchAllDay = function () {
            // This is reverted, we are inserting the 'old' value.s
            $scope.cachedDurValue[$scope.currentItem.allDay ? 0 : 1] = $scope.currentItem.dur;
            if ($scope.cachedDurValue[$scope.currentItem.allDay ? 1 : 0])
                $scope.currentItem.dur = $scope.cachedDurValue[$scope.currentItem.allDay ? 1 : 0];
            else
                $scope.currentItem.dur = constants.defaultTaskDuration[$scope.currentItem.allDay ? 1 : 0];
            $scope.myItems.processEventDuration($scope.currentItem);
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('task', $scope, $scope.open, $scope.close);

        $scope.save = function () {
            $scope.myItems.processSaveRequest($scope.currentItem, function () {
                ModalService.closeModalInternal('task');
            }, function () {
                ModalService.closeModalInternal('task');
            });
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

        $scope.recalculateDeps = function () {
            $scope.filteredDependencies = $scope.myItems.items.filter(function (inspectedItem) {
                if (inspectedItem.type !== 'task')
                    return false;
                if (!$scope.commonFilter(inspectedItem))
                    return false;
                if (MyItems.getBTime().diff(inspectedItem.due, 'm') > 0)
                    return false;
                if ($scope.currentItem && $scope.currentItem.constraint.start && inspectedItem.constraint.end) {
                    var latestPossibleStartOfInspectedEvent = Item.latestPossibleStart(inspectedItem);
                    var earliestPossibleFinishOfCurrentEvent = Item.earliestPossibleFinish($scope.currentItem);
                    if (earliestPossibleFinishOfCurrentEvent.diff(latestPossibleStartOfInspectedEvent, 'm') > 0)
                        return false;
                }
                return true;
            });
        };

        $scope.recalculatePreqs = function () {
            $scope.filteredPrerequisites = $scope.myItems.items.filter(function (inspectedItem) {
                if (!$scope.commonFilter(inspectedItem))
                    return false;
                if (inspectedItem.type === 'task' && MyItems.getBTime().diff(inspectedItem.due, 'm') > 0)
                    return false;
                if (inspectedItem.type === 'event' && MyItems.getBTime().diff(inspectedItem.end, 'm') > 0)
                    return false;
                if ($scope.currentItem && inspectedItem.constraint.start && $scope.currentItem.constraint.end) {
                    var latestPossibleStartOfCurrentEvent = Item.latestPossibleStart($scope.currentItem);
                    var earliestPossibleFinishOfInspectedEvent = Item.earliestPossibleFinish(inspectedItem);
                    if (latestPossibleStartOfCurrentEvent.diff(earliestPossibleFinishOfInspectedEvent, 'm') < 0)
                        return false;
                }
                return true;
            });
        };

        $scope.startValueForOrderingOfPrerequisites = function (event) {
            return -event.start.unix();
        };

        $scope.startValueForOrderingOfDependencies = function (event) {
            return event.start.unix();
        };

        $scope.processDueDateChange = function () {
            Item.setDueFromDateAndTime($scope.currentItem);

            MyItems.processEventDuration($scope.currentItem);

            if (!MyItems.recalcEventConstraints($scope.currentItem))
                $scope.currentItem.error = 'Impossible to schedule due to constraints';
            else {
                $scope.recalculateDeps();
                if (!$rootScope.canDoDateTimeInputs) {
                    $('#taskDueDate').timepicker('option', {'minDate': $scope.currentItem.constraint.startDue ? $scope.currentItem.constraint.startDue.format('MM/DD/YYYY') : null, 'maxDate': $scope.currentItem.constraint.endDue ? $scope.currentItem.constraint.endDue.format('MM/DD/YYYY') : null});
                    $('#taskDueTime').timepicker('option', {'minTime': $scope.currentItem.constraint.startDueTime, 'maxTime': $scope.currentItem.constraint.endDueTime});
                }
            }

            $scope.form.$setDirty();
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'task') {
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
            if (ModalService.currentModal === 'task') {
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
            ModalService.modals.task.modal.remove();
        });
    });

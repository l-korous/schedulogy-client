angular.module('Schedulogy').controller('EventModalCtrl', function (DateUtils, $scope, constants, MyItems, Item, moment, Notification, $timeout, MyResources, ModalService, $ionicScrollDelegate, $rootScope) {
    $scope.myItems = MyItems;
    $scope.myResources = MyResources;
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

        $scope.recalculateDeps();

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
                //if($rootScope.canDoDateTimeInputs)
                $("#eventStartDate").datepicker({
                    onClose: function (dateText, inst) {
                        $scope.currentItem.startDate = dateText;
                        $scope.processStartDateChange();
                    },
                    minDate: $scope.currentItem.constraint.start.format('MM/DD/YYYY'),
                    maxDate: $scope.currentItem.constraint.end.format('MM/DD/YYYY')
                });

                $("#eventStartTime").timepicker({
                    timeFormat: 'H:i',
                    minTime: $scope.currentItem.constraint.startTime,
                    maxTime: $scope.currentItem.constraint.endTime
                });
                
                $("#eventStartTime").on('change', function() {
                    $scope.currentItem.startTime = $('#eventStartTime')[0].value;
                    $scope.processStartDateChange();
                })
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

    $scope.recalculateDeps = function () {
        $scope.filteredDependencies = $scope.myItems.items.filter(function (inspectedItem) {
            if (inspectedItem.type !== 'task')
                return false;
            if (!$scope.commonFilter(inspectedItem))
                return false;
            if ($scope.currentItem.start.diff(inspectedItem.due, 'm') > 0)
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

    $scope.processStartDateChange = function () {
        Item.setStartFromDateAndTime($scope.currentItem);
        
        MyItems.processEventDuration($scope.currentItem);

        if (!MyItems.recalcEventConstraints($scope.currentItem))
            $scope.currentItem.error = 'Impossible to schedule due to constraints';
        else {
            $scope.recalculateDeps();
            if (!$rootScope.canDoDateTimeInputs) {
                $('#eventStartTime').timepicker('option', {'minDate': $scope.currentItem.constraint.start.format('MM/DD/YYYY'), 'maxDate': $scope.currentItem.constraint.end.format('MM/DD/YYYY')});
                $('#eventStartTime').timepicker('option', {'minTime': $scope.currentItem.constraint.startTime, 'maxTime': $scope.currentItem.constraint.endTime});
            }
        }

        $scope.form.$setDirty();
    };

    $scope.processRepetitionEndDateChange = function () {
        $scope.currentItem.repetition.end = moment($scope.currentItem.repetition.endDate);
        Item.setRepetitionEnd($scope.currentItem);
        $scope.form.endDate.$setDirty();
    };

    $scope.$on('Esc', function () {
        if (ModalService.currentModal === 'event') {
            $scope.close();
        }
    });

    $scope.$on('Enter', function () {
        if (ModalService.currentModal === 'event') {
            $scope.save();
        }
    });

    $scope.$on('$destroy', function () {
        ModalService.modals.event.modal.remove();
    });
});

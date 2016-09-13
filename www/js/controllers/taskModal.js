angular.module('Schedulogy')
    .controller('TaskModalCtrl', function (DateUtils, $scope, settings, MyEvents, Event, moment, ionicDatePicker, ionicTimePicker, $rootScope, $timeout, MyResources, ModalService, $ionicScrollDelegate, lodash) {
        $scope.myEvents = MyEvents;
        $scope.myResources = MyResources;
        $scope.maxEventDuration = settings.maxEventDuration;
        $scope.popupOpen = false;
        $scope.currentEvent = null;
        // Used in changing of the task type to offer better UX - by changing the types, you can get back to what you had selected there for the previous type.
        $scope.taskSwitchingValues = {};

        $scope.open = function () {
            $scope.myResources.refresh();

            if (!MyEvents.currentEvent)
                MyEvents.emptyCurrentEvent();

            $scope.currentEvent = angular.extend({}, $scope.myEvents.currentEvent);

            $scope.eventPrevType = null;

            $scope.form.$setPristine();

            $(function () {
                $('#taskModalTextarea').autogrow();
            });

            ModalService.openModalInternal('task', function () {
                $ionicScrollDelegate.scrollTop();
                var primaryInput = $(ModalService.modals.task.modalInternal.modalEl).find('#primaryInput');
                primaryInput.focus();
                primaryInput.select();
            });
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('task', $scope, $scope.open, $scope.close);

        $scope.save = function () {
            $scope.myEvents.saveEvent($scope.currentEvent, function () {
                ModalService.closeModalInternal();
            });
        };

        $scope.$watch('currentEvent.type', function (newValue, oldValue) {
            if (oldValue && newValue) {
                $scope.taskSwitchingValues[oldValue] = {
                    dur: parseInt($scope.currentEvent.dur),
                    start: $scope.currentEvent.start.clone(),
                    due: $scope.currentEvent.due.clone()
                };

                MyEvents.processChangeOfEventType($scope.currentEvent, oldValue);
                if ($scope.taskSwitchingValues[newValue]) {
                    $scope.currentEvent.dur = $scope.taskSwitchingValues[newValue].dur;
                    Event.setStart($scope.currentEvent, $scope.taskSwitchingValues[newValue].start.clone());
                    Event.setDue($scope.currentEvent, $scope.taskSwitchingValues[newValue].due.clone());
                }
                else
                    MyEvents.imposeEventDurationBound($scope.currentEvent);

                MyEvents.processEventDuration($scope.currentEvent);
                if (!MyEvents.recalcEventConstraints($scope.currentEvent))
                    $scope.currentEvent.error = 'Impossible to schedule due to constraints';
            }
        });

        $scope.processEventDuration = function () {
            if (!$scope.myEvents.recalcEventConstraints($scope.currentEvent))
                $scope.currentEvent.error = 'Impossible to schedule due to constraints';
        };

        $scope.renderEventDuration = function () {
            $scope.myEvents.processEventDuration($scope.currentEvent);
        };

        $scope.remove = function () {
            $scope.myEvents.deleteEventById($scope.myEvents.currentEvent._id, function () {
                ModalService.closeModalInternal();
            });
        };

        $scope.commonFilter = function (inspectedEvent) {
            if ($scope.currentEvent && inspectedEvent._id === $scope.currentEvent._id)
                return false;
            var retVal = true;
            if ($scope.currentEvent && ($scope.currentEvent.blocks || $scope.currentEvent.needs)) {
                $scope.currentEvent.blocks && $scope.currentEvent.blocks.forEach(function (other) {
                    if (other === inspectedEvent._id)
                        retVal = false;
                });
                $scope.currentEvent.needs && $scope.currentEvent.needs.forEach(function (other) {
                    if (other === inspectedEvent._id)
                        retVal = false;
                });
            }
            return retVal;
        };

        $scope.blocksFilter = function (inspectedEvent) {
            if (inspectedEvent.type !== 'floating')
                return false;
            if (!$scope.commonFilter(inspectedEvent))
                return false;
            if ($scope.currentEvent && $scope.currentEvent.constraint.start && inspectedEvent.constraint.end) {
                var latestPossibleStartOfInspectedEvent = Event.latestPossibleStart(inspectedEvent);
                var earliestPossibleFinishOfCurrentEvent = Event.earliestPossibleFinish($scope.currentEvent);
                if (earliestPossibleFinishOfCurrentEvent.diff(latestPossibleStartOfInspectedEvent, 'm') > 0)
                    return false;
            }
            return true;
        };

        $scope.needsFilter = function (inspectedEvent) {
            if (!$scope.commonFilter(inspectedEvent))
                return false;
            if ($scope.currentEvent && inspectedEvent.constraint.start && $scope.currentEvent.constraint.end) {
                var latestPossibleStartOfCurrentEvent = Event.latestPossibleStart($scope.currentEvent);
                var earliestPossibleFinishOfInspectedEvent = Event.earliestPossibleFinish(inspectedEvent);
                if (latestPossibleStartOfCurrentEvent.diff(earliestPossibleFinishOfInspectedEvent, 'm') < 0)
                    return false;
            }
            return true;
        };

        $scope.startValueForOrderingOfDependencies = function (event) {
            return event.start.unix();
        };

        // Date & time pickers
        var datesUsed = [{name: 'start'}, {name: 'due'}];
        datesUsed.forEach(function (d) {
            d.dp = {
                callback: function (val) {
                    $scope.currentEvent[d.name] = DateUtils.pushDatePart(moment(val), $scope.currentEvent[d.name]);
                    $scope.currentEvent[d.name + 'DateText'] = $scope.currentEvent[d.name].format(settings.dateFormat);
                    $scope.currentEvent[d.name + 'TimeText'] = $scope.currentEvent[d.name].format(settings.timeFormat);
                    if (d.name === 'start')
                        MyEvents.processEventDuration($scope.currentEvent);
                    if (!MyEvents.recalcEventConstraints($scope.currentEvent))
                        $scope.currentEvent.error = 'Impossible to schedule due to constraints';

                    $scope.form.$setDirty();
                }
            };
            d.tp = {
                callback: function (val) {
                    $scope.currentEvent[d.name] = DateUtils.pushTime(val, $scope.currentEvent[d.name]);
                    $scope.currentEvent[d.name + 'DateText'] = $scope.currentEvent[d.name].format(settings.dateFormat);
                    $scope.currentEvent[d.name + 'TimeText'] = $scope.currentEvent[d.name].format(settings.timeFormat);
                    if (d.name === 'start')
                        MyEvents.processEventDuration($scope.currentEvent);
                    if (!MyEvents.recalcEventConstraints($scope.currentEvent))
                        $scope.currentEvent.error = 'Impossible to schedule due to constraints';

                    $scope.form.$setDirty();
                }
            };
        });
        $scope.reinitDatePicker = function (dateUsed) {
            dateUsed.inputDate = $scope.currentEvent ? ($scope.currentEvent.type === 'floating' ? $scope.currentEvent.due.toDate() : $scope.currentEvent.start.toDate()) : MyEvents.getBTime();
            if ($scope.currentEvent.constraint.start)
                dateUsed.from = $scope.currentEvent.constraint.start.toDate();
            if ($scope.currentEvent.constraint.end)
                dateUsed.to = $scope.currentEvent.constraint.end.toDate();
        };
        $scope.reinitTimePicker = function (dateUsed) {
            dateUsed.inputTime = $scope.currentEvent ? ($scope.currentEvent.type === 'floating' ? (DateUtils.toMinutes($scope.currentEvent.due) * 60) : (DateUtils.toMinutes($scope.currentEvent.start) * 60)) : MyEvents.getBTime();
            if ($scope.currentEvent.type === 'floating') {
                // This is for the 'due' time picker.
                var dueDateEqualsStartConstraint =
                    $scope.currentEvent.constraint.start ? DateUtils.equalDays($scope.currentEvent.due, $scope.currentEvent.constraint.startDue) : false;

                var dueDateEqualsEndConstraint =
                    $scope.currentEvent.constraint.end ? DateUtils.equalDays($scope.currentEvent.due, $scope.currentEvent.constraint.end) : false;

                dateUsed.constraint = {
                    from: dueDateEqualsStartConstraint ? (DateUtils.toMinutes($scope.currentEvent.constraint.startDue)) : settings.startHour * 60,
                    to: dueDateEqualsEndConstraint ? DateUtils.toMinutes($scope.currentEvent.constraint.end) : settings.endHour * 60
                };
            }
            else {// here the event type is fixed, because allDay events do not have timePicker shown.
                // This is for the 'start' time picker.
                var startDateEqualsStartConstraint =
                    $scope.currentEvent.constraint.start ? DateUtils.equalDays($scope.currentEvent.start, $scope.currentEvent.constraint.start) : false;

                var startDateEqualsEndConstraint =
                    $scope.currentEvent.constraint.end ? DateUtils.equalDays($scope.currentEvent.start, $scope.currentEvent.constraint.end) : false;

                dateUsed.constraint = {
                    from: startDateEqualsStartConstraint ? (DateUtils.toMinutes($scope.currentEvent.constraint.start)) : 0,
                    to: startDateEqualsEndConstraint ? DateUtils.toMinutes($scope.currentEvent.constraint.end) : 24 * 60
                };
            }
        };
        $scope.openDatePicker = function (dateUsed) {
            $scope.popupOpen = true;
            var dateUsedConfig = datesUsed.find(function (e) {
                return e.name === dateUsed;
            });
            $scope.reinitDatePicker(dateUsedConfig.dp);
            ionicDatePicker.openDatePicker(dateUsedConfig.dp);
        };
        $scope.openTimePicker = function (dateUsed) {
            $scope.popupOpen = true;
            var dateUsedConfig = datesUsed.find(function (e) {
                return e.name === dateUsed;
            });
            $scope.reinitTimePicker(dateUsedConfig.tp);
            ionicTimePicker.openTimePicker(dateUsedConfig.tp);
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

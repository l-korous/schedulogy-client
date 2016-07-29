angular.module('Schedulogy')
    .controller('TaskModalCtrl', function (DateUtils, $scope, settings, MyEvents, Event, moment, ionicDatePicker, ionicTimePicker) {
        // Register confirm callback in parent.
        $scope.$parent.modals.task.confirmCallback = function () {
            $scope.saveEvent();
        };

        $scope.maxEventDuration = settings.maxEventDuration;
        // TODO - can we do this in the view directly from settings?
        $scope.noPrerequisitesToListMsg = settings.noPrerequisitesToListMsg;
        $scope.noDependenciesToListMsg = settings.noDependenciesToListMsg;

        $scope.myEvents = MyEvents;

        $scope.saveEvent = function () {
            MyEvents.saveEvent(MyEvents.currentEvent);
        };

        $scope.commonFilter = function (inspectedEvent) {
            if (MyEvents.currentEvent && inspectedEvent._id === MyEvents.currentEvent._id)
                return false;
            var retVal = true;
            if (MyEvents.currentEvent && (MyEvents.currentEvent.blocks || MyEvents.currentEvent.needs)) {
                MyEvents.currentEvent.blocks && MyEvents.currentEvent.blocks.forEach(function (other) {
                    if (other === inspectedEvent._id)
                        retVal = false;
                });
                MyEvents.currentEvent.needs && MyEvents.currentEvent.needs.forEach(function (other) {
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
            if (MyEvents.currentEvent && MyEvents.currentEvent.constraint.start && inspectedEvent.constraint.end) {
                var latestPossibleStartOfInspectedEvent = Event.latestPossibleStart(inspectedEvent);
                var earliestPossibleFinishOfCurrentEvent = Event.earliestPossibleFinish(MyEvents.currentEvent);
                if (earliestPossibleFinishOfCurrentEvent.diff(latestPossibleStartOfInspectedEvent, 'm') > 0)
                    return false;
            }
            return true;
        };
        $scope.needsFilter = function (inspectedEvent) {
            if (!$scope.commonFilter(inspectedEvent))
                return false;
            if (MyEvents.currentEvent && inspectedEvent.constraint.start && MyEvents.currentEvent.constraint.end) {
                var latestPossibleStartOfCurrentEvent = Event.latestPossibleStart(MyEvents.currentEvent);
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
                    MyEvents.currentEvent[d.name] = DateUtils.pushDatePart(moment(val), MyEvents.currentEvent[d.name]);
                    MyEvents.currentEvent[d.name + 'DateText'] = MyEvents.currentEvent[d.name].format(settings.dateFormat);
                    MyEvents.currentEvent[d.name + 'TimeText'] = MyEvents.currentEvent[d.name].format(settings.timeFormat);
                    if (d.name === 'start')
                        $scope.updateEndDateTimeWithDuration();
                }
            };
            d.tp = {
                callback: function (val) {
                    MyEvents.currentEvent[d.name] = DateUtils.pushTime(val, MyEvents.currentEvent[d.name]);
                    MyEvents.currentEvent[d.name + 'DateText'] = MyEvents.currentEvent[d.name].format(settings.dateFormat);
                    MyEvents.currentEvent[d.name + 'TimeText'] = MyEvents.currentEvent[d.name].format(settings.timeFormat);
                    if (d.name === 'start')
                        $scope.updateEndDateTimeWithDuration();
                }
            };
        });
        $scope.reinitDatePicker = function (dateUsed) {
            dateUsed.inputDate = MyEvents.currentEvent ? (MyEvents.currentEvent.type === 'floating' ? MyEvents.currentEvent.due.toDate() : MyEvents.currentEvent.start.toDate()) : MyEvents.getBTime();
            dateUsed.from = MyEvents.currentEvent.constraint.start.toDate();
            dateUsed.to = MyEvents.currentEvent.constraint.end.toDate();
        };
        $scope.reinitTimePicker = function (dateUsed) {
            dateUsed.inputTime = MyEvents.currentEvent ? (MyEvents.currentEvent.type === 'floating' ? (DateUtils.toMinutes(MyEvents.currentEvent.due) * 60) : (DateUtils.toMinutes(MyEvents.currentEvent.start) * 60)) : MyEvents.getBTime();
            if (MyEvents.currentEvent.type === 'floating') {
                // This is for the 'due' time picker.
                var dueDateEqualsStartConstraint =
                    MyEvents.currentEvent.constraint.start ? DateUtils.equalDays(MyEvents.currentEvent.due, MyEvents.currentEvent.constraint.start) : false;

                var dueDateEqualsEndConstraint =
                    MyEvents.currentEvent.constraint.end ? DateUtils.equalDays(MyEvents.currentEvent.due, MyEvents.currentEvent.constraint.end) : false;

                dateUsed.constraint = {
                    from: dueDateEqualsStartConstraint ? (DateUtils.toMinutesPlusDuration(MyEvents.currentEvent.constraint.start, MyEvents.currentEvent.dur)) : 0,
                    to: dueDateEqualsEndConstraint ? DateUtils.toMinutes(MyEvents.currentEvent.constraint.end) : 24 * 60
                };
            }
            else {// here the event type is fixed, because allDay events do not have timePicker shown.
                // This is for the 'start' time picker.
                var startDateEqualsStartConstraint =
                    MyEvents.currentEvent.constraint.start ? DateUtils.equalDays(MyEvents.currentEvent.start, MyEvents.currentEvent.constraint.start) : false;

                var startDateEqualsEndConstraint =
                    MyEvents.currentEvent.constraint.end ? DateUtils.equalDays(MyEvents.currentEvent.start, MyEvents.currentEvent.constraint.end) : false;

                dateUsed.constraint = {
                    from: startDateEqualsStartConstraint ? (DateUtils.toMinutes(MyEvents.currentEvent.constraint.start)) : 0,
                    to: startDateEqualsEndConstraint ? DateUtils.toMinutes(MyEvents.currentEvent.constraint.end) : 24 * 60
                };
            }
        };
        $scope.openDatePicker = function (dateUsed) {
            var dateUsedConfig = datesUsed.find(function (e) {
                return e.name === dateUsed;
            });
            $scope.reinitDatePicker(dateUsedConfig.dp);
            ionicDatePicker.openDatePicker(dateUsedConfig.dp);
        };
        $scope.openTimePicker = function (dateUsed) {
            var dateUsedConfig = datesUsed.find(function (e) {
                return e.name === dateUsed;
            });
            $scope.reinitTimePicker(dateUsedConfig.tp);
            ionicTimePicker.openTimePicker(dateUsedConfig.tp);
        };
    });

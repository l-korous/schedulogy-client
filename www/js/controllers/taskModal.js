angular.module('Schedulogy')
    .controller('TaskModalCtrl', function (DateUtils, $scope, settings, MyEvents, Event, moment, ionicDatePicker, ionicTimePicker) {
        $scope.maxEventDuration = settings.maxEventDuration;

        $scope.myEvents = MyEvents;

        $scope.commonFilter = function (inspectedEvent) {
            if (MyEvents.currentEvent && inspectedEvent._id === MyEvents.currentEvent._id)
                return false;
            var retVal = true;
            if (MyEvents.currentEvent && (MyEvents.currentEvent.blocks || MyEvents.currentEvent.needs)) {
                MyEvents.currentEvent.blocks.forEach(function (other) {
                    if (other === inspectedEvent._id)
                        retVal = false;
                });
                MyEvents.currentEvent.needs.forEach(function (other) {
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
            if (MyEvents.currentEvent && MyEvents.currentEvent.constraint.start && MyEvents.currentEvent.constraint.end) {
                var latestPossibleStartOfInspectedEvent = Event.latestPossibleStart(inspectedEvent);
                var earliestPossibleFinishOfCurrentEvent = Event.earliestPossibleFinish(MyEvents.currentEvent);
                if (earliestPossibleFinishOfCurrentEvent.diff(latestPossibleStartOfInspectedEvent, 'h') > 0)
                    return false;
            }
            return true;
        };
        $scope.needsFilter = function (inspectedEvent) {
            if (!$scope.commonFilter(inspectedEvent))
                return false;
            if (MyEvents.currentEvent && MyEvents.currentEvent.constraint.start && MyEvents.currentEvent.constraint.end) {
                var latestPossibleStartOfCurrentEvent = Event.latestPossibleStart(MyEvents.currentEvent);
                var earliestPossibleFinishOfInspectedEvent = Event.earliestPossibleFinish(inspectedEvent);
                if (latestPossibleStartOfCurrentEvent.diff(earliestPossibleFinishOfInspectedEvent, 'h') < 0)
                    return false;
            }
            return true;
        };
        $scope.startValueForOrderingOfDependencies = function (event) {
            return event.start.unix();
        };

        $scope.keyUpHandler = function (keyCode, formInvalid) {
            if (keyCode === 13 && !formInvalid) {
                $scope.closeModal();
                $scope.saveEvent();
            }
            if (keyCode === 27)
                $scope.closeModal();
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
            dateUsed.inputTime = MyEvents.currentEvent ? (MyEvents.currentEvent.type === 'floating' ? (MyEvents.currentEvent.due.hour() * 3600) : (MyEvents.currentEvent.start.hour() * 3600)) : MyEvents.getBTime();
            if (MyEvents.currentEvent.type === 'floating')
                dateUsed.constraint = {
                    from: (MyEvents.currentEvent.start.format("YYYY-MM-DD") === MyEvents.currentEvent.constraint.start.format("YYYY-MM-DD")) ? MyEvents.currentEvent.constraint.start.hour() + MyEvents.currentEvent.dur : 0,
                    to: (MyEvents.currentEvent.end.format("YYYY-MM-DD") === MyEvents.currentEvent.constraint.end.format("YYYY-MM-DD")) ? MyEvents.currentEvent.constraint.end.hour() - MyEvents.currentEvent.dur : 24
                };
            else
                dateUsed.constraint = {
                    from: (MyEvents.currentEvent.start.format("YYYY-MM-DD") === MyEvents.currentEvent.constraint.start.format("YYYY-MM-DD")) ? MyEvents.currentEvent.constraint.start.hour() : 0,
                    to: (MyEvents.currentEvent.end.format("YYYY-MM-DD") === MyEvents.currentEvent.constraint.end.format("YYYY-MM-DD")) ? MyEvents.currentEvent.constraint.end.hour() - MyEvents.currentEvent.dur : 24
                };
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

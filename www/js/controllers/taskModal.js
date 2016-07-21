angular.module('Schedulogy')
    .controller('TaskModalCtrl', ['DateUtils', '$scope', '$ionicModal', 'settings', 'MyEvents', 'Event',
        '$window', '$timeout', 'Task', 'moment', 'ionicDatePicker', 'ionicTimePicker', '$filter', '$ionicLoading',
        function (DateUtils, $scope, $ionicModal, settings, MyEvents, Event, $window, $timeout,
            Task, moment, ionicDatePicker, ionicTimePicker, $filter, $ionicLoading) {

            $scope.modalSettings = {
                maxDuration: {
                    fixed: 24,
                    fixedAllDay: 14,
                    floating: settings.endHour - settings.startHour
                }
            };

            $scope.myEvents = MyEvents;

            $scope.handleChangeOfEventType = function (eventPassed) {
                var event = eventPassed || $scope.currentEvent;
                if (event.dur > $scope.modalSettings.maxDuration[event.type])
                    event.dur = $scope.modalSettings.maxDuration[event.type];
                $scope.updateEndDateTimeWithDuration(event);
                event.color = settings.eventColor[event.type];
            };

            $scope.commonFilter = function (inspectedEvent) {
                if ($scope.currentEvent && inspectedEvent._id === $scope.currentEvent._id)
                    return false;
                var retVal = true;
                if ($scope.currentEvent && ($scope.currentEvent.blocks || $scope.currentEvent.needs)) {
                    $scope.currentEvent.blocks.forEach(function (other) {
                        if (other === inspectedEvent._id)
                            retVal = false;
                    });
                    $scope.currentEvent.needs.forEach(function (other) {
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
                if ($scope.currentEvent) {
                    var latestPossibleStartOfInspectedEvent = Event.latestPossibleStart(inspectedEvent);
                    var earliestPossibleFinishOfCurrentEvent = Event.earliestPossibleFinish($scope.currentEvent);
                    if (earliestPossibleFinishOfCurrentEvent.diff(latestPossibleStartOfInspectedEvent, 'h') > 0)
                        return false;
                }
                return true;
            };
            $scope.needsFilter = function (inspectedEvent) {
                if (!$scope.commonFilter(inspectedEvent))
                    return false;
                if ($scope.currentEvent) {
                    var latestPossibleStartOfCurrentEvent = Event.latestPossibleStart($scope.currentEvent);
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
                        $scope.currentEvent[d.name] = DateUtils.pushDatePart(moment(val), $scope.currentEvent[d.name]);
                        $scope.currentEvent[d.name + 'DateText'] = $scope.currentEvent[d.name].format(settings.dateFormat);
                        $scope.currentEvent[d.name + 'TimeText'] = $scope.currentEvent[d.name].format(settings.timeFormat);
                        if (d.name === 'start')
                            $scope.updateEndDateTimeWithDuration();
                    }
                };
                d.tp = {
                    callback: function (val) {
                        $scope.currentEvent[d.name] = DateUtils.pushTime(val, $scope.currentEvent[d.name]);
                        $scope.currentEvent[d.name + 'DateText'] = $scope.currentEvent[d.name].format(settings.dateFormat);
                        $scope.currentEvent[d.name + 'TimeText'] = $scope.currentEvent[d.name].format(settings.timeFormat);
                        if (d.name === 'start')
                            $scope.updateEndDateTimeWithDuration();
                    }
                };
            });
            $scope.reinitDatePicker = function (dateUsed) {
                dateUsed.inputDate = $scope.currentEvent ? (dateUsed === 'due' ? $scope.currentEvent.due.toDate() : $scope.currentEvent.start.toDate()) : MyEvents.getBTime();
                dateUsed.from = $scope.currentEvent.constraint.start.toDate();
                dateUsed.to = $scope.currentEvent.constraint.end.toDate();
            };
            $scope.reinitTimePicker = function (dateUsed) {
                dateUsed.inputTime = $scope.currentEvent ? (dateUsed === 'due' ? ($scope.currentEvent.due.hour() * 3600) : ($scope.currentEvent.start.hour() * 3600)) : MyEvents.getBTime();
                if (dateUsed === 'due')
                    dateUsed.constraint = {
                        from: ($scope.currentEvent.start.format("YYYY-MM-DD") === $scope.currentEvent.constraint.start.format("YYYY-MM-DD")) ? $scope.currentEvent.constraint.start.hour() + $scope.currentEvent.dur : 0,
                        to: ($scope.currentEvent.end.format("YYYY-MM-DD") === $scope.currentEvent.constraint.end.format("YYYY-MM-DD")) ? $scope.currentEvent.constraint.end.hour() - $scope.currentEvent.dur : 24
                    };
                else
                    dateUsed.constraint = {
                        from: ($scope.currentEvent.start.format("YYYY-MM-DD") === $scope.currentEvent.constraint.start.format("YYYY-MM-DD")) ? $scope.currentEvent.constraint.start.hour() : 0,
                        to: ($scope.currentEvent.end.format("YYYY-MM-DD") === $scope.currentEvent.constraint.end.format("YYYY-MM-DD")) ? $scope.currentEvent.constraint.end.hour() - $scope.currentEvent.dur : 24
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
        }]);

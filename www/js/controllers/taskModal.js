angular.module('Schedulogy')
    .controller('TaskModalCtrl', function (DateUtils, $scope, settings, MyEvents, Event, moment, ionicDatePicker, ionicTimePicker, $rootScope, $timeout, MyResources, ModalService, $ionicScrollDelegate) {
        $scope.myEvents = MyEvents;
        $scope.myResources = MyResources;
        $scope.popupOpen = false;
        $scope.modalEl = null;

        ModalService.createModal('task', $scope, {}, $scope.open, $scope.close);

        $scope.open = function () {
            $scope.myResources.refresh();

            if (!MyEvents.currentEvent) {
                MyEvents.emptyCurrentEvent();
            }

            $scope.form.$setPristine();

            var primaryInput = $($scope.modalEl).find('#primaryInput');
            if ($rootScope.isMobileLow || $rootScope.isMobileNarrow) {
                primaryInput.focus();
                primaryInput.select();
            }

            $(function () {
                $('#taskModalTextarea').autogrow();
            });

            ModalService.openModalInternal('task', function () {
                $ionicScrollDelegate.scrollTop();
            });
        };

        $scope.close = function () {
            ModalService.closeModalInternal(function () {
                $scope.form.$setPristine();
            });
        };

        $scope.save = function () {
            $scope.myEvents.saveEvent();
            $scope.close();
        };

        $scope.maxEventDuration = settings.maxEventDuration;

        $scope.deleteCurrentEvent = function () {
            $scope.myEvents.deleteEventById($scope.myEvents.currentEvent._id, function () {
                $scope.close();
            });
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
                        MyEvents.updateEndDateTimeWithDuration();
                    if (!MyEvents.recalcConstraints())
                        MyEvents.currentEvent.error = 'Impossible to schedule due to constraints';

                    var primaryInput = $('.form').find('#primaryInput');
                    angular.element(primaryInput).scope().form.$setDirty();
                }
            };
            d.tp = {
                callback: function (val) {
                    MyEvents.currentEvent[d.name] = DateUtils.pushTime(val, MyEvents.currentEvent[d.name]);
                    MyEvents.currentEvent[d.name + 'DateText'] = MyEvents.currentEvent[d.name].format(settings.dateFormat);
                    MyEvents.currentEvent[d.name + 'TimeText'] = MyEvents.currentEvent[d.name].format(settings.timeFormat);
                    if (d.name === 'start')
                        MyEvents.updateEndDateTimeWithDuration();
                    if (!MyEvents.recalcConstraints())
                        MyEvents.currentEvent.error = 'Impossible to schedule due to constraints';

                    var primaryInput = $('.form').find('#primaryInput');
                    angular.element(primaryInput).scope().form.$setDirty();
                }
            };
        });
        $scope.reinitDatePicker = function (dateUsed) {
            dateUsed.inputDate = MyEvents.currentEvent ? (MyEvents.currentEvent.type === 'floating' ? MyEvents.currentEvent.due.toDate() : MyEvents.currentEvent.start.toDate()) : MyEvents.getBTime();
            if (MyEvents.currentEvent.constraint.start)
                dateUsed.from = MyEvents.currentEvent.constraint.start.toDate();
            if (MyEvents.currentEvent.constraint.end)
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
                    from: dueDateEqualsStartConstraint ? (DateUtils.toMinutesPlusDuration(MyEvents.currentEvent.constraint.start, MyEvents.currentEvent.dur)) : settings.startHour * 60,
                    to: dueDateEqualsEndConstraint ? DateUtils.toMinutes(MyEvents.currentEvent.constraint.end) : settings.endHour * 60
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

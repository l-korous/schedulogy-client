angular.module('Schedulogy')
    .controller('CalendarCtrl', ['DateUtils', '$scope', '$ionicModal', 'uiCalendarConfig', 'settings', 'MyEvents',
        '$window', '$ionicPopover', '$timeout', 'Task', 'moment', 'ionicDatePicker', 'ionicTimePicker', '$filter', '$ionicLoading',
        function (DateUtils, $scope, $ionicModal, uiCalendarConfig, settings, MyEvents, $window, $ionicPopover, $timeout, Task, moment, ionicDatePicker, ionicTimePicker, $filter, $ionicLoading) {
            /* event source that pulls from google.com */
            $scope.eventSource = {
                url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
                className: 'gcal-event', // an option!
                currentTimezone: 'America/Chicago' // an option!
            };
            $scope.eventSources = [MyEvents.events];

            $scope.emptyCurrentEvent = function () {
                var btime = DateUtils.getBTime();
                var btimePlusDuration = btime.clone().add(settings.defaultTaskDuration, 'hours');

                $scope.currentEvent = {
                    new : true,
                    stick: true,
                    type: settings.defaultTaskType,
                    dur: settings.defaultTaskDuration,
                    start: btime,
                    startDateText: btime.format(settings.dateFormat),
                    startTimeText: btime.format(settings.timeFormat),
                    end: btimePlusDuration,
                    endDateText: btimePlusDuration.format(settings.dateFormat),
                    endTimeText: btimePlusDuration.format(settings.timeFormat),
                    due: btimePlusDuration,
                    dueDateText: btimePlusDuration.format(settings.dateFormat),
                    dueTimeText: btimePlusDuration.format(settings.timeFormat),
                    deps: [],
                    depsForShow: [],
                    constraint: {
                        start: null,
                        end: null
                    }
                };
            };

            $scope.uiConfig = {
                calendar: {
                    defaultView: 'agendaWeek',
                    weekends: false,
                    timezone: 'local',
                    timeFormat: 'H:mm',
                    slotLabelFormat: 'H:mm',
                    eventBackgroundColor: '#387ef5',
                    eventBorderColor: '#aaa',
                    eventColor: '#387ef5',
                    axisFormat: 'H:mm',
                    selectConstraint: {
                        start: DateUtils.getBTime(),
                        end: DateUtils.getBTime().clone().add(settings.weeks, 'weeks')
                    },
                    slotDuration: '01:00:00',
                    defaultDate: settings.fixedBTime.on ? moment(settings.fixedBTime.date) : moment(new Date()),
                    now: settings.fixedBTime.on ? moment(settings.fixedBTime.date) : moment(new Date()),
                    firstDay: 1,
                    nowIndicator: true,
                    editable: true,
                    header: {
                        left: 'agendaDay agendaWeek month',
                        center: 'title',
                        right: 'today prev,next'
                    },
                    minTime: settings.startHour + ':00:00',
                    maxTime: settings.endHour + ':00:00',
                    selectable: true,
                    eventConstraint: {
                        start: DateUtils.getBTime(),
                        end: DateUtils.getBTime().clone().add(settings.weeks, 'weeks')
                    },
                    businessHours: {
                        start: settings.startHour + ':00:00',
                        end: settings.endHour + ':00:00'
                    },
                    eventResize: function (event, delta, revertFunc, jsEvent, ui, view) {
                        if (event.type === 'fixed')
                            event.dur += delta.hours();
                        else if (event.type === 'fixedAllDay')
                            event.dur += delta.days();
                        else if (event.type === 'floating') {
                            event.type = 'fixed';
                            event.dur += delta.hours();
                            $scope.handleChangeOfEventType(event);
                        }

                        $scope.saveEvent(event);
                    },
                    eventClick: function (calEvent, jsEvent, view) {
                        $scope.currentEvent = calEvent;
                        $scope.openModal();
                    },
                    eventDrop: function (event, delta, revertFunc) {
                        $scope.saveEvent(event);
                    },
                    select: function (start, end, jsEvent, view, resource) {
                        $scope.emptyCurrentEvent();
                        $scope.currentEvent = angular.extend($scope.currentEvent, {
                            type: 'fixed',
                            start: start,
                            startDateText: start.format(settings.dateFormat),
                            startTimeText: start.format(settings.timeFormat),
                            end: end,
                            endDateText: end.format(settings.dateFormat),
                            endTimeText: end.format(settings.timeFormat),
                            dur: end.diff(start, 'h'),
                            due: end,
                            dueDateText: end.format(settings.dateFormat),
                            dueTimeText: end.format(settings.timeFormat),
                        });

                        if (view.name === 'month' || !(start.hasTime() || end.hasTime())) {
                            $scope.currentEvent.dur = end.diff(start, 'd');
                            $scope.currentEvent.type = 'fixedAllDay';
                        }
                        $scope.updateEndDateTimeWithDuration();

                        $scope.openModal();
                    },
                    viewRender: function (view, element) {

                    },
                    eventMouseover: function (event, jsEvent, view) {
                        var newdiv1 = $('<i class="icon ion-close assertive eventDeleter">');

                        $(jsEvent.currentTarget).append(newdiv1);

                        $('.eventDeleter').click(function (evt) {
                            evt.stopPropagation();
                            angular.element(this).scope().deleteEventById(event._id);
                        });
                    },
                    eventMouseout: function (event, jsEvent, view) {
                        $('i').remove(".eventDeleter");
                    }
                }
            };
            $scope.calculateCalendarRowHeight = function () {
                var row_height = Math.max(settings.minCalendarRowHeight, ($window.innerHeight - settings.shiftAgendaRows) / (settings.endHour - settings.startHour));
                var style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = '.fc-time-grid .fc-slats td { height: ' + row_height.toString() + 'px; }';
                var list = document.getElementsByTagName('head')[0], item = document.getElementsByTagName('head')[0].lastElementChild;
                list.removeChild(item);
                list.appendChild(style);
                $timeout(function () {
                    uiCalendarConfig.calendars['theOnlyCalendar'].fullCalendar('option', 'contentHeight', $window.innerHeight - settings.shiftCalendar);
                });
            };

            $scope.calculateCalendarRowHeight();

            angular.element($window).bind('resize', function () {
                $scope.calculateCalendarRowHeight();
            });

            Task.query(function (data) {
                MyEvents.importFromTasks(data.tasks);
            });

            // Popover 'coming soon'.
            $ionicPopover.fromTemplateUrl('templates/popovers/coming_soon.html', {
                scope: $scope
            }).then(function (popover) {
                $scope.comingSoonPopover = popover;
            });
            $scope.openPopover = function ($event) {
                $scope.comingSoonPopover.show($event);
            };
            $scope.closePopover = function () {
                $scope.comingSoonPopover.hide();
            };
            // Task edit modal.
            $ionicModal.fromTemplateUrl('templates/popovers/task_modal.html', {
                scope: $scope,
                animation: 'animated zoomIn'
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.modalSettings = {
                maxDuration: {
                    fixed: 24,
                    fixedAllDay: 14,
                    floating: settings.endHour - settings.startHour
                }
            };
            $scope.openModal = function (clear) {
                if (!$scope.currentEvent || clear) {
                    $scope.emptyCurrentEvent();
                }

                if (angular.element($('#eventTitleEdit')).scope())
                    angular.element($('#eventTitleEdit')).scope().taskSaveForm.$setPristine();

                $scope.modal.show().then(function () {
                    // This is ugly hack, should be fixed.
                    $('#eventTitleEdit').focus();
                    $('#eventTitleEdit').select();
                });
            };

            $scope.updateEndDateTimeWithDuration = function (eventPassed) {
                var event = eventPassed || $scope.currentEvent;

                event.end = event.start.clone().add(event.dur, event.type === 'fixedAllDay' ? 'days' : 'hours');

                // For all-day events, we are displaying the end day the same as the current one.
                if (event.type === 'fixedAllDay') {
                    var custom_end = event.start.clone();
                    event.endDateText = custom_end.format(settings.dateFormat);
                    event.endTimeText = custom_end.format(settings.timeFormat);
                }
                else if (event.type === 'fixed') {
                    event.endDateText = event.end.format(settings.dateFormat);
                    event.endTimeText = event.end.format(settings.timeFormat);
                }
            };

            $scope.handleChangeOfEventType = function (eventPassed) {
                var event = eventPassed || $scope.currentEvent;
                if (event.dur > $scope.modalSettings.maxDuration[event.type])
                    event.dur = $scope.modalSettings.maxDuration[event.type];
                $scope.updateEndDateTimeWithDuration(event);
                event.color = settings.eventColor[event.type];
            };

            $scope.closeModal = function () {
                $scope.modal.hide();
            };

            $scope.saveEvent = function (passedEvent) {
                var eventToSave = passedEvent || $scope.currentEvent;

                $ionicLoading.show({
                    template: 'Loading...'
                });

                Task.fromEvent(eventToSave).$save(function (data, headers) {
                    MyEvents.importFromTasks(data.tasks);
                    $ionicLoading.hide();
                },
                    function (err) {
                        $ionicLoading.hide();

                        // error callback
                        console.log(err);
                    });
            };

            $scope.deleteEvent = function (passedEvent) {
                var eventToDelete = passedEvent || $scope.currentEvent;

                $ionicLoading.show({
                    template: 'Loading...'
                });

                Task.fromEvent(eventToDelete).$remove({taskId: eventToDelete._id}, function (data, headers) {
                    MyEvents.importFromTasks(data.tasks);
                    $ionicLoading.hide();
                },
                    function (err) {
                        $ionicLoading.hide();

                        // error callback
                        console.log(err);
                    });
            };

            $scope.deleteEventById = function (passedEventId) {
                $scope.deleteEvent(MyEvents.findEventById(passedEventId));
            };

            $scope.addDependency = function (eventId) {
                $scope.currentEvent.deps.push(eventId);
                MyEvents.fillDepsForShow($scope.currentEvent);
            };

            $scope.removeDependency = function (event) {
                for (var i = $scope.currentEvent.deps.length - 1; i >= 0; i--) {
                    if ($scope.currentEvent.deps[i] === event._id) {
                        $scope.currentEvent.deps.splice(i, 1);
                        $scope.currentEvent.depsForShow.splice(i, 1);
                    }
                }
            };

            $scope.notDependencyOrMe = function (inspectedEvent) {
                if ($scope.currentEvent && inspectedEvent._id === $scope.currentEvent._id)
                    return false;
                var retVal = true;
                if ($scope.currentEvent && $scope.currentEvent.deps) {
                    $scope.currentEvent.deps.forEach(function (dependency) {
                        if (dependency._id === inspectedEvent._id)
                            retVal = false;
                    });
                }
                return retVal;
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
                dateUsed.inputDate = $scope.currentEvent ? ($scope.currentEvent.due ? $scope.currentEvent.due.toDate() : $scope.currentEvent.start.toDate()) : DateUtils.getBTime();
            };

            $scope.reinitTimePicker = function (dateUsed) {
                dateUsed.inputTime = $scope.currentEvent ? ($scope.currentEvent.due ? ($scope.currentEvent.due.hour() * 3600) : ($scope.currentEvent.start.hour() * 3600)) : DateUtils.getBTime();
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

            // Cleanup when destroying.
            $scope.$on('$destroy', function () {
                $scope.comingSoonPopover.remove();
                $scope.modal.remove();
            });
        }]);

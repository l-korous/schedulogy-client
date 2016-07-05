angular.module('Scheduler')
    .controller('CalendarCtrl', ['DateUtils', '$scope', '$ionicModal', 'uiCalendarConfig', 'settings', '$window', '$ionicPopover', '$timeout', 'Task', 'moment', 'ionicDatePicker', 'ionicTimePicker', function (DateUtils, $scope, $ionicModal, uiCalendarConfig, settings, $window, $ionicPopover, $timeout, Task, moment, ionicDatePicker, ionicTimePicker) {
            /* event source that pulls from google.com */
            $scope.eventSource = {
                url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
                className: 'gcal-event', // an option!
                currentTimezone: 'America/Chicago' // an option!
            };
            $scope.tasks = [];
            $scope.eventSources = [$scope.tasks];
            $scope.printEvent = function () {
                console.dir($scope.currentEvent);
            };
            $scope.uiConfig = {
                calendar: {
                    defaultView: 'agendaWeek',
                    weekends: false,
                    timezone: 'local',
                    timeFormat: 'H:mm',
                    slotLabelFormat: 'H:mm',
                    axisFormat: 'H:mm',
                    selectConstraint: {
                        start: DateUtils.getBTime(),
                        end: DateUtils.getBTime().clone().add(settings.weeks, 'weeks')
                    },
                    slotDuration: '01:00:00',
                    defaultDate: settings.fixedBTime.on ? moment(settings.fixedBTime.date) : moment(new Date()),
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
                    eventConstraint: "businessHours",
                    businessHours: {
                        start: settings.startHour + ':00:00',
                        end: settings.endHour + ':00:00'
                    },
                    eventResize: function (event, delta, revertFunc, jsEvent, ui, view) {
                        Task.fromEvent(event).$save(function (resp, headers) {
                            //success callback
                            console.log(resp);
                        },
                            function (err) {
                                // error callback
                                console.log(err);
                            });
                    },
                    eventClick: function (calEvent, jsEvent, view) {
                        $scope.currentEvent = calEvent;
                        $scope.openModal();
                    },
                    eventDrop: function (event, delta, revertFunc) {
                        Task.fromEvent(event).$save(function (resp, headers) {
                            //success callback
                            console.log(resp);
                        },
                            function (err) {
                                // error callback
                                console.log(err);
                            });
                    },
                    select: function (start, end, jsEvent, view, resource) {
                        $scope.currentEvent = {
                            type: 'fixed',
                            start: start,
                            startDateText: start.format(settings.dateFormat),
                            startTimeText: start.format(settings.timeFormat),
                            end: end,
                            endDateText: end.format(settings.dateFormat),
                            endTimeText: end.format(settings.timeFormat),
                            duration: end.diff(start, 'h')
                        };
                        $scope.openModal();
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
            Task.query(function (data) {
                data.tasks.forEach(function (task) {
                    $scope.tasks.push(Task.toEvent(task));
                });
            });
            $scope.calculateCalendarRowHeight();
            angular.element($window).bind('resize', function () {
                $scope.calculateCalendarRowHeight();
            });
            // Popover coming soon.
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
                maxDuration: settings.endHour - settings.startHour
            };
            $scope.openModal = function () {
                if (!$scope.currentEvent) {
                    var btime = DateUtils.getBTime();
                    var btimePlusDuration = btime.clone().add(settings.defaultTaskDuration, 'hours');
                    $scope.currentEvent = {
                        type: settings.defaultTaskType,
                        duration: settings.defaultTaskDuration,
                        start: btime,
                        startDateText: btime.format(settings.dateFormat),
                        startTimeText: btime.format(settings.timeFormat),
                        end: btimePlusDuration,
                        endDateText: btimePlusDuration.format(settings.dateFormat),
                        endTimeText: btimePlusDuration.format(settings.timeFormat),
                        due: btimePlusDuration,
                        dueDateText: btimePlusDuration.format(settings.dateFormat),
                        dueTimeText: btimePlusDuration.format(settings.timeFormat)
                    };
                }
                $scope.modal.show();
            };
            $scope.updateEndTimeWithDuration = function () {
                $scope.currentEvent.end = $scope.currentEvent.start.clone().add($scope.currentEvent.duration, 'hours');
                $scope.currentEvent.endDateText = $scope.currentEvent.end.format(settings.dateFormat);
                $scope.currentEvent.endTimeText = $scope.currentEvent.end.format(settings.timeFormat);
            };
            $scope.updateDurationWithStartTime = function () {
                if ($scope.currentEvent.start.hours() + $scope.currentEvent.duration > settings.endHour) {
                    $scope.currentEvent.duration = settings.endHour - $scope.currentEvent.start.hours();
                    $scope.updateEndTimeWithDuration();
                }
            };
            $scope.closeModal = function () {
                $scope.modal.hide();
            };
            // Cleanup everything.
            $scope.$on('$destroy', function () {
                $scope.comingSoonPopover.remove();
                $scope.modal.remove();
            });
            $scope.saveCurrentTask = function () {
                Task.fromEvent($scope.currentEvent).$save(function (resp, headers) {
                    //success callback
                    console.log(resp);
                },
                    function (err) {
                        // error callback
                        console.log(err);
                    });
            };
            var datesUsed = [{name: 'start'}, {name: 'due'}];
            datesUsed.forEach(function (d) {
                d.dp = {
                    from: new Date(),
                    callback: function (val) {
                        $scope.currentEvent[d.name] = DateUtils.pushDatePart(moment(val), $scope.currentEvent[d.name]);
                        $scope.currentEvent[d.name + 'DateText'] = $scope.currentEvent[d.name].format(settings.dateFormat);
                        $scope.currentEvent[d.name + 'TimeText'] = $scope.currentEvent[d.name].format(settings.timeFormat);
                    }
                };
                d.tp = {
                    callback: function (val) {
                        $scope.currentEvent[d.name] = DateUtils.pushTime(val, $scope.currentEvent[d.name]);
                        $scope.currentEvent[d.name + 'DateText'] = $scope.currentEvent[d.name].format(settings.dateFormat);
                        $scope.currentEvent[d.name + 'TimeText'] = $scope.currentEvent[d.name].format(settings.timeFormat);
                    }
                };
            });
            $scope.openDatePicker = function (dateUsed) {
                ionicDatePicker.openDatePicker(($.grep(datesUsed, function (e) {
                    return e.name === dateUsed;
                }))[0].dp);
            };
            $scope.openTimePicker = function (dateUsed) {
                ionicTimePicker.openTimePicker(($.grep(datesUsed, function (e) {
                    return e.name === dateUsed;
                }))[0].tp);
            };
        }]);

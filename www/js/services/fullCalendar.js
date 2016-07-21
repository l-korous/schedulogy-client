angular.module('Schedulogy')
    .service('FullCalendar', function (moment, settings, Task, MyEvents, DateUtils, $ionicLoading, $window, $timeout, uiCalendarConfig) {
        this.setCallbacks = function (toSet) {
            this.callbacks = toSet;
        };

        this.emptyCurrentEvent = function () {
            var btime = DateUtils.getBTime();
            var btimePlusDuration = btime.clone().add(settings.defaultTaskDuration, 'hours');

            this.currentEvent = {
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
                blocks: [],
                blocksForShow: [],
                needs: [],
                needsForShow: [],
                constraint: {
                    start: null,
                    end: null
                }
            };
        };

        this.uiConfig = {
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
                        this.handleChangeOfEventType(event);
                    }

                    this.callbacks.eventResize();
                },
                eventClick: function (calEvent, jsEvent, view) {
                    this.currentEvent = calEvent;
                    this.callbacks.eventClick();
                },
                eventDrop: function (event, delta, revertFunc) {
                    this.callbacks.eventDrop();
                },
                select: function (start, end, jsEvent, view, resource) {
                    this.emptyCurrentEvent();
                    this.currentEvent = angular.extend(this.currentEvent, {
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
                        this.currentEvent.dur = end.diff(start, 'd');
                        this.currentEvent.type = 'fixedAllDay';
                    }

                    this.callbacks.select();
                },
                viewRender: function (view, element) {

                },
                eventMouseover: function (event, jsEvent, view) {
                    var newdiv1 = $('<i class="icon ion-close assertive eventDeleter">');

                    $(jsEvent.currentTarget).append(newdiv1);

                    $('.eventDeleter').click(function (evt) {
                        evt.stopPropagation();
                        this.deleteEventById(event._id);
                    });
                },
                eventMouseout: function (event, jsEvent, view) {
                    $('i').remove(".eventDeleter");
                }
            }
        };

        this.deleteEventById = function (passedEventId) {
            this.deleteEvent(MyEvents.findEventById(passedEventId));
        };

        this.calculateCalendarRowHeight = function () {
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

        this.updateEndDateTimeWithDuration = function (eventPassed) {
            var event = eventPassed || this.currentEvent;

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

        this.deleteEvent = function (passedEvent) {
            var eventToDelete = passedEvent || this.currentEvent;

            $ionicLoading.show({
                template: 'Loading...'
            });

            Task.fromEvent(eventToDelete).$remove({taskId: eventToDelete._id}, function (data, headers) {
                MyEvents.importFromTasks(data.tasks);
                $ionicLoading.hide();
            }, function (err) {
                $ionicLoading.hide();

                // error callback
                console.log(err);
            });
        };

        //////// Done at start
        this.calculateCalendarRowHeight();
        angular.element($window).bind('resize', function () {
            this.calculateCalendarRowHeight();
        });
    });
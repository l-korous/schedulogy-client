angular.module('Schedulogy')
    .service('FullCalendar', function (moment, settings, Task, MyEvents, DateUtils, $window, $timeout, uiCalendarConfig) {
        var _this = this;

        this.setCallbacks = function (toSet) {
            this.callbacks = toSet;
        };

        this.uiConfig = {
            calendar: {
                defaultView: 'agendaWeek',
                weekends: false,
                timezone: 'local',
                timeFormat: 'H:mm',
                slotLabelFormat: 'H:mm',
                eventBackgroundColor: '#387ef5',
                eventBorderColor: '#000',
                eventColor: '#387ef5',
                axisFormat: 'H:mm',
                selectConstraint: {
                    start: MyEvents.getBTime(),
                    end: MyEvents.getBTime().clone().add(settings.weeks, 'weeks')
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
                    start: MyEvents.getBTime(),
                    end: MyEvents.getBTime().clone().add(settings.weeks, 'weeks')
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
                        MyEvents.handleChangeOfEventType(event);
                    }

                    _this.saveEvent(event);
                },
                eventClick: function (calEvent, jsEvent, view) {
                    MyEvents.currentEvent = calEvent;
                    _this.callbacks.eventClick(MyEvents.currentEvent);
                },
                eventDrop: function (event, delta, revertFunc) {
                    _this.saveEvent(event);
                },
                select: function (start, end, jsEvent, view, resource) {
                    MyEvents.emptyCurrentEvent();
                    MyEvents.currentEvent = angular.extend(MyEvents.currentEvent, {
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
                        MyEvents.currentEvent.dur = end.diff(start, 'd');
                        MyEvents.currentEvent.type = 'fixedAllDay';
                    }

                    _this.callbacks.select();
                },
                viewRender: function (view, element) {

                },
                eventMouseover: function (event, jsEvent, view) {
                    var newdiv1 = $('<i class="icon ion-close assertive eventDeleter">');

                    $(jsEvent.currentTarget).append(newdiv1);

                    $('.eventDeleter').click(function (evt) {
                        evt.stopPropagation();
                        MyEvents.deleteEventById(event._id);
                    });
                },
                eventMouseout: function (event, jsEvent, view) {
                    $('i').remove(".eventDeleter");
                }
            }
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

        //////// Done at start
        this.calculateCalendarRowHeight();
        
        angular.element($window).bind('resize', function () {
            _this.calculateCalendarRowHeight();
        });
    });
angular.module('Schedulogy')
    .service('FullCalendar', function (moment, settings, MyEvents, $window, $timeout, uiCalendarConfig, $rootScope) {
        var _this = this;

        this.setCallbacks = function (toSet) {
            this.callbacks = toSet;
        };

        this.uiConfig = {
            calendar: {
                defaultView: $rootScope.isMobileNarrow ? 'agenda3Day' : 'agendaWeek',
                views: {
                    agenda3Day: {
                        type: 'agenda',
                        duration: {days: 3},
                        buttonText: '3 days'
                    }
                },
                weekends: true,
                timezone: 'local',
                timeFormat: 'H:mm',
                slotLabelFormat: 'H:mm',
                eventBackgroundColor: '#387ef5',
                eventBorderColor: '#000',
                eventColor: '#387ef5',
                axisFormat: 'H:mm',
                selectConstraint: {
                    start: MyEvents.getBTime().clone().subtract(1, 'second'),
                    end: MyEvents.getBTime().clone().add(settings.weeks, 'weeks')
                },
                slotDuration: '00:30:00',
                defaultDate: settings.fixedBTime.on ? moment(settings.fixedBTime.date) : MyEvents.getBTime(),
                now: MyEvents.getBTime(),
                firstDay: 1,
                nowIndicator: true,
                editable: true,
                header: {
                    left: $rootScope.isMobileNarrow ? 'agendaDay agenda3Day agendaWeek' : 'agendaDay agenda3Day agendaWeek month',
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
                    _this.callbacks.eventResize(event, delta, revertFunc, jsEvent);
                },
                eventClick: function (calEvent) {
                    MyEvents.currentEvent = calEvent;
                    _this.callbacks.eventClick();
                },
                eventDrop: function (event, delta, revertFunc, jsEvent) {
                    _this.callbacks.eventDrop(event, delta, revertFunc, jsEvent);
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
                        dur: Math.ceil(end.diff(start, 'm') / settings.minuteGranularity),
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
                    var newdiv1 = $('<i class="icon ion-trash-b eventDeleter" title="Delete">');

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
            var row_height = Math.max(settings.minCalendarRowHeight, ($window.innerHeight - settings.shiftAgendaRows[($rootScope.isMobileNarrow || $rootScope.isMobileLow) ? 'mobile' : 'normal']) / (settings.slotsPerHour * (settings.endHour - settings.startHour)));
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = '.fc-time-grid .fc-slats td { height: ' + row_height.toString() + 'px; }';
            // Hiding the title on narrow mobile.
            if ($rootScope.isMobileNarrow)
                style.innerHTML += '.fc-center { display:none ! important; }';
            var list = document.getElementsByTagName('head')[0], item = document.getElementsByTagName('head')[0].lastElementChild;
            list.removeChild(item);
            list.appendChild(style);
            $timeout(function () {
                uiCalendarConfig.calendars['theOnlyCalendar'].fullCalendar('option', 'contentHeight', $window.innerHeight - settings.shiftCalendar[($rootScope.isMobileNarrow || $rootScope.isMobileLow) ? 'mobile' : 'normal']);
            });
        };

        angular.element($window).bind('resize', function () {
            _this.calculateCalendarRowHeight();
        });
    });
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
                    left: 'agendaDay agenda3Day agendaWeek month',
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
                eventClick: function (event) {
                    _this.callbacks.eventClick(event);
                },
                eventDrop: function (event, delta, revertFunc, jsEvent) {
                    _this.callbacks.eventDrop(event, delta, revertFunc, jsEvent);
                },
                select: function (start, end, jsEvent, view, resource) {
                    _this.callbacks.select(start, end, jsEvent, view, resource);
                },
                viewRender: function (view, element) {

                },
                eventMouseover: function (event, jsEvent, view) {
                    if ($rootScope.isMobileLow || $rootScope.isMobileNarrow)
                        return;
                    else {
                        var newdiv1 = $('<i class="icon ion-trash-b eventDeleter" title="Delete">');

                        $(jsEvent.currentTarget).append(newdiv1);

                        $('.eventDeleter').click(function (evt) {
                            evt.stopPropagation();
                            MyEvents.deleteEventById(event._id);
                        });
                    }
                },
                eventMouseout: function (event, jsEvent, view) {
                    if ($rootScope.isMobileLow || $rootScope.isMobileNarrow)
                        return;
                    else
                        $('i').remove(".eventDeleter");
                }
            }
        };

        this.calculateCalendarRowHeight = function () {
            //var row_height = Math.max(settings.minCalendarRowHeight, ($window.innerHeight - settings.shiftAgendaRows[($rootScope.isMobileNarrow || $rootScope.isMobileLow) ? 'mobile' : 'normal']) / (settings.slotsPerHour * (settings.endHour - settings.startHour)));
            var row_height = settings.minCalendarRowHeight;
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
                uiCalendarConfig.calendars['theOnlyCalendar'].fullCalendar('option', 'contentHeight', $window.innerHeight - settings.shiftCalendar[$rootScope.isMobileNarrow ? 'mobileNarrow' : ($rootScope.isMobileLow ? 'mobileLow' : 'normal')]);
            });
        };

        angular.element($window).bind('resize', function () {
            _this.calculateCalendarRowHeight();
        });
    });
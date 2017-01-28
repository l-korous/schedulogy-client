angular.module('Schedulogy')
    .service('FullCalendar', function (moment, settings, constants, MyItems, $window, $timeout, uiCalendarConfig, $rootScope) {
        var _this = this;

        this.setCallbacks = function (toSet) {
            this.callbacks = toSet;
        };

        this.uiConfig = {
            calendar: {
                defaultView: $rootScope.smallScreen ? 'agenda3Day' : 'agendaWeek',
                weekends: true,
                navLinks: true,
                weekNumbers: true,
                timezone: 'local',
                timeFormat: 'H:mm',
                // We move to some user-friendly slot 1 slot before the current one.
                scrollTime: (MyItems.getBTime().hours() < 1 ? MyItems.getBTime().clone() : MyItems.getBTime().clone().subtract(constants.minuteGranularity, 'minute')).format('HH:mm:ss'),
                scrollOffsetMinutes: constants.minuteGranularity,
                slotLabelFormat: 'H:mm',
                eventBackgroundColor: '#387ef5',
                eventBorderColor: '#000',
                eventColor: '#387ef5',
                axisFormat: 'H:mm',
                selectConstraint: {
                    start: MyItems.getBTime().clone().subtract(1, 'second'),
                    end: MyItems.getBTime().clone().add(constants.weeks, 'weeks')
                },
                slotDuration: '00:30:00',
                defaultDate: settings.fixedBTime.on ? moment(settings.fixedBTime.date) : MyItems.getBTime(),
                now: MyItems.getBTime,
                firstDay: 1,
                slotEventOverlap: false,
                nowIndicator: true,
                editable: true,
                header: {
                    left: 'agendaDay,agenda3Day,agendaWeek,month,listMonth',
                    center: 'title',
                    right: 'prevLong,prev,now,next,nextLong'
                },
                minTime: constants.startHour + ':00:00',
                maxTime: constants.endHour + ':00:00',
                selectable: true,
                eventConstraint: {
                    start: MyItems.getBTime(),
                    end: MyItems.getBTime().clone().add(constants.weeks, 'weeks')
                },
                businessHours: {
                    start: constants.startHour + ':00:00',
                    end: constants.endHour + ':00:00'
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
                    if (jsEvent)
                        _this.callbacks.select(start, end, jsEvent, view, resource);
                },
                refreshOnNow: function() {
                    $rootScope.refreshStuff();
                },
                viewRender: function (view, element) {
                    switch (view.name) {
                        case 'listMonth':
                            $('#button-customId-prev').hide();
                            $('#button-customId-next').hide();
                            $('#button-customId-prevLong').show();
                            $('#button-customId-nextLong').show();
                            break;
                        case 'agendaDay':
                            $('#button-customId-prev').show();
                            $('#button-customId-next').show();
                            $('#button-customId-prevLong').hide();
                            $('#button-customId-nextLong').hide();
                            break;
                        default:
                            $('#button-customId-prev').show();
                            $('#button-customId-next').show();
                            $('#button-customId-prevLong').show();
                            $('#button-customId-nextLong').show();
                            break;
                    }
                },
                eventAfterAllRender: function () {
                    $rootScope.$broadcast('calendarRendered');
                },
                eventMouseover: function (event, jsEvent, view) {
                    if ($rootScope.smallScreen)
                        return;
                    else {
                        var newdiv1 = $('<i class="icon itemDeleter" title="Delete">X</i>');

                        console.log($(jsEvent.currentTarget).children().last());
                        if (view.name === 'listMonth')
                            $(jsEvent.currentTarget).children().last().append(newdiv1);
                        else
                            $(jsEvent.currentTarget).append(newdiv1);

                        $('.itemDeleter').click(function (evt) {
                            evt.stopPropagation();
                            MyItems.processDeleteRequest(event._id);
                        });
                    }
                },
                eventMouseout: function (event, jsEvent, view) {
                    if ($rootScope.smallScreen)
                        return;
                    else
                        $('i').remove(".itemDeleter");
                }
            }
        };

        this.calculateCalendarRowHeight = function () {
            var row_height = constants.minCalendarRowHeight;
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = '.fc-time-grid .fc-slats td { height: ' + row_height.toString() + 'px; }';
            var list = document.getElementsByTagName('head')[0], item = document.getElementsByTagName('head')[0].lastElementChild;
            list.removeChild(item);
            list.appendChild(style);
            $timeout(function () {
                uiCalendarConfig.calendars['theOnlyCalendar'].fullCalendar('option', 'contentHeight', $window.innerHeight - constants.shiftCalendar[$rootScope.smallScreen ? 'smallScreen' : 'normal']);
            });
        };

        angular.element($window).bind('resize', function () {
            _this.calculateCalendarRowHeight();
        });
    });
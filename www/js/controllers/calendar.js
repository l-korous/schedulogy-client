angular.module('Schedulogy')
    .controller('CalendarCtrl', function ($scope, settings, MyEvents, FullCalendar, $rootScope, ModalService, $timeout, DateUtils) {
        $rootScope.allSet = false;
        $scope.myEvents = MyEvents;
        FullCalendar.calculateCalendarRowHeight();

        $scope.$on('MyEventsLoaded', function () {
            $rootScope.allSet = true;
        });

        $scope.eventSources = [MyEvents.events];

        $scope.onSwipeLeft = function () {
            $('#theOnlyCalendar').fullCalendar('next');
        };

        $scope.onSwipeRight = function () {
            $('#theOnlyCalendar').fullCalendar('prev');
        };

        $scope.myCalendar = FullCalendar;

        $scope.myCalendar.setCallbacks({
            eventClick: function (event) {
                MyEvents.currentEvent = event;
                ModalService.openModal('task');
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

                MyEvents.processEventDuration();
                ModalService.openModal('task');
            },
            eventDrop: function (event, delta, revertFunc, jsEvent) {
                MyEvents.currentEvent = event;
                if (event.type === 'floating') {
                    ModalService.openModal('floatToFixed');
                    ModalService.modals.floatToFixed.scope.setFloatToFixedData({
                        floatToFixedDelta: delta,
                        floatToFixedEvent: event,
                        floatToFixedMethod: 'drop',
                        floatToFixedRevertFunc: revertFunc
                    });
                }
                else if (MyEvents.currentEvent.type === 'fixed' && MyEvents.currentEvent.allDay) {
                    MyEvents.currentEvent.type = 'fixedAllDay';
                    MyEvents.processChangeOfEventType(MyEvents.currentEvent, 'fixed');
                    MyEvents.imposeEventDurationBound();
                    MyEvents.saveEvent();
                }

                else if (MyEvents.currentEvent.type === 'fixedAllDay' && !MyEvents.currentEvent.allDay) {
                    MyEvents.currentEvent.type = 'fixed';
                    MyEvents.processChangeOfEventType(MyEvents.currentEvent, 'fixedAllDay');
                    MyEvents.currentEvent.start.add(delta._milliseconds, 'ms');
                    MyEvents.imposeEventDurationBound();
                    MyEvents.saveEvent();
                }
                else
                    MyEvents.saveEvent();
            },
            eventResize: function (event, delta, revertFunc) {
                MyEvents.currentEvent = event;
                if (event.type === 'fixed') {
                    event.dur += (delta._data.hours * settings.slotsPerHour);
                    event.dur += (delta._data.minutes / settings.minuteGranularity);
                    MyEvents.imposeEventDurationBound();
                    MyEvents.processEventDuration();
                    if (!MyEvents.recalcEventConstraints())
                        $scope.currentEvent.error = 'Impossible to schedule due to constraints';
                    MyEvents.saveEvent();
                }
                else if (event.type === 'fixedAllDay') {
                    event.dur += delta.days();
                    MyEvents.imposeEventDurationBound();
                    MyEvents.processEventDuration();
                    if (!MyEvents.recalcEventConstraints())
                        $scope.currentEvent.error = 'Impossible to schedule due to constraints';
                    MyEvents.saveEvent();
                }
                else if (event.type === 'floating') {
                    ModalService.openModal('floatToFixed');
                    ModalService.modals.floatToFixed.scope.setFloatToFixedData({
                        floatToFixedDelta: delta,
                        floatToFixedEvent: event,
                        floatToFixedMethod: 'resize',
                        floatToFixedRevertFunc: revertFunc
                    });
                }
            }
        });
    });

angular.module('Schedulogy')
    .controller('CalendarCtrl', function ($scope, settings, MyEvents, FullCalendar, $rootScope, ModalService, $timeout, DateUtils) {
        $scope.myEvents = MyEvents;
        FullCalendar.calculateCalendarRowHeight();

        $scope.$on('MyEventsLoaded', function () {
            $rootScope.isLoading = false;
        });

        $scope.eventSources = [MyEvents.events];

        $scope.onSwipeLeft = function () {
            if ($rootScope.isMobileNarrow || $rootScope.isMobileLow)
                $('#theOnlyCalendar').fullCalendar('next');
        };

        $scope.onSwipeRight = function () {
            if ($rootScope.isMobileNarrow || $rootScope.isMobileLow)
                $('#theOnlyCalendar').fullCalendar('prev');
        };

        $scope.myCalendar = FullCalendar;

        $scope.myCalendar.setCallbacks({
            eventClick: function (event) {
                MyEvents.setCurrentEvent(event._id);
                ModalService.openModal('task');
            },
            select: function (start, end, jsEvent, view, resource) {
                MyEvents.newCurrentEvent({
                    start: start,
                    end: end,
                    type: (view.name === 'month' || !(start.hasTime() || end.hasTime())) ? 'fixedAllDay' : 'fixed',
                    dur: (view.name === 'month' || !(start.hasTime() || end.hasTime())) ? end.diff(start, 'd') : Math.ceil(end.diff(start, 'm') / settings.minuteGranularity)
                });

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

angular.module('Schedulogy')
    .controller('CalendarCtrl', function ($scope, constants, MyItems, MyResources, MyUsers, FullCalendar, $rootScope, ModalService, Item, $timeout) {
        $scope.myItems = MyItems;
        FullCalendar.calculateCalendarRowHeight();

        $scope.onSwipeLeft = function () {
            if ($rootScope.smallScreen)
                $('#theOnlyCalendar').fullCalendar('nextLong');
        };

        $scope.onSwipeRight = function () {
            if ($rootScope.smallScreen)
                $('#theOnlyCalendar').fullCalendar('prevLong');
        };

        $scope.myCalendar = FullCalendar;

        $scope.myCalendar.setCallbacks({
            eventClick: function (event) {
                MyItems.setCurrentItem(event._id);
                ModalService.openModal(event.type);
            },
            select: function (start, end, jsEvent, view, resource) {
                MyItems.newCurrentItem('event');

                angular.extend(MyItems.currentItem, {
                    start: start,
                    end: end,
                    type: 'event',
                    allDay: (view.name === 'month' || !(start.hasTime() || end.hasTime())),
                    dur: (view.name === 'month' || !(start.hasTime() || end.hasTime())) ? end.diff(start, 'd') : Math.ceil(end.diff(start, 'm') / constants.minuteGranularity)
                });
                Item.setStart(MyItems.currentItem);
                Item.setEnd(MyItems.currentItem);
                Item.setDur(MyItems.currentItem);

                ModalService.openModal('event');
            },
            eventDrop: function (event, delta, revertFunc, jsEvent) {
                MyItems.currentItem = event;
                if (event.type === 'task') {
                    ModalService.openModal('floatToFixed');
                    ModalService.modals.floatToFixed.scope.setFloatToFixedData({
                        floatToFixedDelta: delta,
                        floatToFixedEvent: event,
                        floatToFixedMethod: 'drop',
                        floatToFixedRevertFunc: revertFunc
                    });
                }
                else {
                    // This means !allDay -> allDay
                    if (MyItems.currentItem.type === 'event' && MyItems.currentItem.allDay && MyItems.currentItem.startTimeText) {
                        Item.setStart(MyItems.currentItem);
                        MyItems.currentItem.dur = constants.defaultTaskDuration[1];
                        MyItems.processEventDuration(MyItems.currentItem);
                    }
                    // This means allDay -> !allDay
                    else if (MyItems.currentItem.type === 'event' && !MyItems.currentItem.allDay && !MyItems.currentItem.startTimeText) {
                        Item.setStart(MyItems.currentItem);
                        MyItems.currentItem.dur = constants.defaultTaskDuration[0];
                        MyItems.processEventDuration(MyItems.currentItem);
                    }

                    MyItems.saveItem();
                }
            },
            eventResize: function (event, delta, revertFunc) {
                MyItems.currentItem = event;
                if (event.type === 'event' && !event.allDay) {
                    event.dur += (delta._data.hours * constants.slotsPerHour);
                    event.dur += (delta._data.minutes / constants.minuteGranularity);
                    MyItems.imposeEventDurationBound();
                    MyItems.processEventDuration();
                    if (!MyItems.recalcEventConstraints())
                        $scope.currentItem.error = 'Impossible to schedule due to constraints';
                    MyItems.saveItem();
                }
                else if (event.type === 'event' && event.allDay) {
                    event.dur += delta.days();
                    MyItems.imposeEventDurationBound();
                    MyItems.processEventDuration();
                    if (!MyItems.recalcEventConstraints())
                        $scope.currentItem.error = 'Impossible to schedule due to constraints';
                    MyItems.saveItem();
                }
                else if (event.type === 'task') {
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

        $timeout(function () {
            MyItems.refresh();
            MyResources.refresh();
            MyUsers.refresh();
        });
    });

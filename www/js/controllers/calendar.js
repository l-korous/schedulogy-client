angular.module('Schedulogy')
    .controller('CalendarCtrl', function ($scope, $ionicModal, settings, MyEvents, $timeout, FullCalendar, $ionicScrollDelegate, Hopscotch, $rootScope) {
        $rootScope.allSet = false;
        $scope.myEvents = MyEvents;
        $rootScope.calendarScope = $scope;
        FullCalendar.calculateCalendarRowHeight();
        $scope.$on('MyEventsLoaded', function () {
            $rootScope.allSet = true;
        });

        /* event source that pulls from google.com */
        $scope.eventSource = {
            url: "https://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
            className: 'gcal-event', // an option!
            currentTimezone: 'America/Chicago' // an option!
        };
        $scope.eventSources = [MyEvents.events];

        $scope.runTour = function () {
            $scope.$emit('Esc');
            Hopscotch.runTour(0);
        };

        $scope.myCalendar = FullCalendar;

        $scope.myCalendar.setCallbacks({
            eventClick: function (event) {
                MyEvents.currentEvent = event;
                $scope.openModal('task');
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

                MyEvents.updateEndDateTimeWithDuration();
                $scope.openModal('task');
            },
            eventDrop: function (event, delta, revertFunc, jsEvent) {
                MyEvents.currentEvent = event;
                if (event.type === 'floating') {
                    $scope.openModal('floatToFixed');
                    $scope.floatToFixedDelta = delta;
                    $scope.floatToFixedEvent = event;
                    $scope.floatToFixedMethod = 'drop';
                    $scope.floatToFixedRevertFunc = revertFunc;
                }
                else {
                    if (MyEvents.processEventDrop(delta))
                        MyEvents.saveEvent();
                }
            },
            eventResize: function (event, delta, revertFunc) {
                MyEvents.currentEvent = event;
                if (event.type === 'fixed') {
                    event.dur += (delta._data.hours * settings.slotsPerHour);
                    event.dur += (delta._data.minutes / settings.minuteGranularity);
                    MyEvents.handleChangeOfEventType();
                    MyEvents.saveEvent();
                }
                else if (event.type === 'fixedAllDay') {
                    event.dur += delta.days();
                    MyEvents.handleChangeOfEventType();
                    MyEvents.saveEvent();
                }
                else if (event.type === 'floating') {
                    $scope.openModal('floatToFixed');
                    $scope.floatToFixedDelta = delta;
                    $scope.floatToFixedEvent = event;
                    $scope.floatToFixedMethod = 'resize';
                    $scope.floatToFixedRevertFunc = revertFunc;
                }
            }
        });

        //////////// MODALS ////////////

        // This is filled by the children if this parent needs to use methods of children controllers.
        $scope.modalScope = {};

        // This is definition of child modals of this parent.
        // - All modals can state callbacks of three actions (open, close (~cancel), confirm (~save)).
        $scope.modals =
            {
                floatToFixed: {
                    closeCallback: function () {
                        
                    },
                    confirmCallback: function () {
                        
                    }
                },
                task: {
                    openCallback: function (params) {
                        
                    },
                    closeCallback: function () {
                        
                    }
                },
                help: {
                },
                removeAll: {
                    confirmCallback: function () {
                        
                    }
                },
                uploadIcal: {
                    // confirmCallback registered in separate controller
                },
                dirtyTasks: {
                }
            };

       
        // Uniform opening of modals.
        $scope.openModal = function (modalName, params) {
            
            
            if ($scope.modalScope[modalName] && $scope.modalScope[modalName].init)
                $scope.modalScope[modalName].init();

            $scope.currentModal = modalName;

            $scope[modalName + 'Modal'].show().then(function () {
                $scope.modals[modalName].openCallback && $scope.modals[modalName].openCallback(params);
                $ionicScrollDelegate.scrollTop();
            });
        };

        // Uniform closing of modals.
        $scope.closeModal = function (modalName, callback) {
            $scope[modalName + 'Modal'].hide();
            $scope.modals[modalName].closeCallback && $scope.modals[modalName].closeCallback();
            callback && callback();
            $scope.currentModal = null;
        };

        // Uniform confirming of modals.
        // This does NOT close the modal.
        $scope.confirmModal = function (modalName, callback) {
            $scope.modals[modalName].confirmCallback && $scope.modals[modalName].confirmCallback();
            callback && callback();
        };
        $scope.$on('modal.hidden', function (event, modal) {
            // This event handler gets fired even if the modal is not in this scope, that is why we must check it first.
            $scope.modals[modal.name] && $scope.modals[modal.name].closeCallback && $scope.modals[modal.name].closeCallback();
            $scope.currentModal = null;
        });

        // 'Close' key handler - using the uniform method.
        $scope.$on('Esc', function () {
            if ($scope.currentModal && !$scope.modalScope[$scope.currentModal]) {
                $scope.closeModal($scope.currentModal);

                // Also close all popups:
                $timeout(function () {
                    $('.button_close').click();
                });
            }
        });
        // 'Confirm' key handler - using the uniform method.
        $scope.$on('Enter', function () {
            if ($scope.currentModal)
                $scope.confirmModal($scope.currentModal);
        });
        // Cleanup when destroying.
        $scope.$on('$destroy', function () {
            for (var modalData in $scope.modals)
                $scope[modalData + 'Modal'].remove();
        });
    });

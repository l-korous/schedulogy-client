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
                        $scope.floatToFixedRevertFunc && $scope.floatToFixedRevertFunc();
                    },
                    confirmCallback: function () {
                        MyEvents.currentEvent = $scope.floatToFixedEvent;
                        MyEvents.currentEvent.type = 'fixed';
                        if ($scope.floatToFixedMethod === 'resize') {
                            MyEvents.currentEvent.dur += ($scope.floatToFixedDelta.minutes() / settings.minuteGranularity);
                            MyEvents.handleChangeOfEventType();
                        }
                        else if ($scope.floatToFixedMethod === 'drop') {
                            if (!MyEvents.processEventDrop($scope.floatToFixedDelta))
                                return;
                        }
                        MyEvents.saveEvent();
                        $scope.floatToFixedModal.hide();
                        $scope.currentModal = null;
                    }
                },
                task: {
                    openCallback: function (params) {
                        if (!MyEvents.currentEvent || params) {
                            MyEvents.emptyCurrentEvent();
                        }

                        // This is ugly hack, should be fixed.
                        var primaryInput = $($scope.taskModal.modalEl).find('#primaryInput');
                        angular.element(primaryInput).scope().taskSaveForm.$setPristine();
                        if ($rootScope.isMobileLow || $rootScope.isMobileNarrow) {
                            primaryInput.focus();
                            primaryInput.select();
                        }

                        $(function () {
                            $('#taskModalTextarea').autogrow();
                        });
                    },
                    closeCallback: function () {
                        var primaryInput = $($scope.taskModal.modalEl).find('#primaryInput');
                        angular.element(primaryInput).scope().taskSaveForm.$setPristine();
                    }
                },
                help: {
                },
                removeAll: {
                    confirmCallback: function () {
                        MyEvents.deleteAll();
                        $scope.removeAllModal.hide();
                        $scope.currentModal = null;
                    }
                },
                uploadIcal: {
                }
            };

        // Uniform instantiating of modals.
        for (var modalData in $scope.modals) {
            $ionicModal.fromTemplateUrl('templates/' + modalData + 'Modal.html', {
                scope: $scope,
                animation: 'animated zoomIn'
            }).then(function (modal) {
                // This is a trick - we need to know which modalData we just finished creating the modal for.
                var modalName = $(modal.el).find('.modalNamingSearch').attr('name');
                $scope[modalName + 'Modal'] = modal;
            });
        }

        // Uniform opening of modals.
        $scope.openModal = function (modalName, params) {
            if ($scope.modalScope[modalName] && $scope.modalScope[modalName].init)
                $scope.modalScope[modalName].init();

            // This is ugly hack, should be fixed. What it does:
            // - keyup event 'Esc' won't fire until the modal has focus
            // - modals which have primary inputs (e.g. task modal) will just focus the first input
            // - modals which do not (float to fixed) have a special dummy hidden input for this purpose
            var focusPrimaryInput = function () {
                if (!$rootScope.isMobileLow && !$rootScope.isMobileNarrow) {
                    var primaryInput = $($scope[$scope.currentModal + 'Modal'].modalEl).find('#primaryInput');
                    primaryInput.focus();
                    primaryInput.select();
                }

                $ionicScrollDelegate.scrollTop();
            };

            $scope.currentModal = modalName;
            $scope[modalName + 'Modal'].show().then(function () {
                focusPrimaryInput();
                $scope.modals[modalName].openCallback && $scope.modals[modalName].openCallback(params);
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

        // 'Close' key handler - using the uniform method.
        $scope.$on('Esc', function () {
            for (var modalData in $scope.modals)
                $scope.closeModal(modalData);

            // Also close all popups:
            $timeout(function () {
                $('.button_close').click();
            });
        });
        // 'Confirm' key handler - using the uniform method.
        $scope.$on('Enter', function () {
            for (var modalData in $scope.modals)
                if (modalData === $scope.currentModal)
                    $scope.confirmModal(modalData);
        });
        // Cleanup when destroying.
        $scope.$on('$destroy', function () {
            for (var modalData in $scope.modals)
                $scope[modalData + 'Modal'].remove();
        });
    });

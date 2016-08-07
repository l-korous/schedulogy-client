angular.module('Schedulogy')
    .controller('CalendarCtrl', function ($scope, $ionicModal, settings, MyEvents, $timeout, FullCalendar, $ionicScrollDelegate, Hopscotch, $rootScope) {
        $rootScope.allSet = false;
        FullCalendar.calculateCalendarRowHeight();
        $scope.$on('TasksLoaded', function () {
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
        $scope.modals =
            {
                floatToFixed: {
                    closeCallback: function () {
                        $scope.floatToFixedRevertFunc && $scope.floatToFixedRevertFunc();
                    },
                    confirmCallback: function () {
                        $scope.floatToFixedEvent.type = 'fixed';
                        if ($scope.floatToFixedMethod === 'resize') {
                            $scope.floatToFixedEvent.dur += ($scope.floatToFixedDelta.minutes() / settings.minuteGranularity);
                            MyEvents.handleChangeOfEventType($scope.floatToFixedEvent);
                        }
                        else if ($scope.floatToFixedMethod === 'drop') {
                            if (!MyEvents.processEventDrop($scope.floatToFixedEvent, $scope.floatToFixedDelta, $scope.floatToFixedRevertFunc))
                                return;
                        }
                        MyEvents.saveEvent($scope.floatToFixedEvent);
                        $scope.floatToFixedModal.hide();
                    }
                },
                task: {
                    openCallback: function (params) {
                        if (!MyEvents.currentEvent || params) {
                            MyEvents.emptyCurrentEvent();
                        }

                        // This is ugly hack, should be fixed.
                        var primaryInput = $($scope[$scope.currentModal + 'Modal'].modalEl).find('#primaryInput');
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
                        MyEvents.refreshEvents();
                    },
                    confirmCallback: function() {
                        $scope.taskModal.hide();
                    }
                },
                help: {
                },
                removeAll: {
                    confirmCallback: function () {
                        MyEvents.deleteAll();
                        $scope.removeModal.hide();
                    }
                },
                uploadIcal: {
                }
            };

        for (var modalData in $scope.modals) {
            $ionicModal.fromTemplateUrl('templates/' + modalData + '.html', {
                scope: $scope,
                animation: 'animated zoomIn'
            }).then(function (modal) {
                // This is a trick - we need to know which modalData we just finished creating the modal for.
                var modalName = $(modal.el).find('.modalNamingSearch').attr('name');
                $scope[modalName + 'Modal'] = modal;
            });
        }

        $scope.openModal = function (modalName, params) {
            // This is ugly hack, should be fixed.
            var focusPrimaryInput = function () {
                if (!$rootScope.isMobileLow && !$rootScope.isMobileNarrow) {
                    var primaryInput = $($scope[$scope.currentModal + 'Modal'].modalEl).find('#primaryInput');
                    primaryInput.focus();
                    primaryInput.select();
                }

                $ionicScrollDelegate.scrollTop();
            };

            $scope.currentModal = modalName;
            $scope[modalName + 'Modal'].show().then(focusPrimaryInput);
            $scope.modals[modalName].openCallback && $scope.modals[modalName].openCallback(params);
        };

        $scope.closeModal = function (modalName, callback) {
            $scope.currentModal = null;
            $scope[modalName + 'Modal'].hide();
            $scope.modals[modalName].closeCallback && $scope.modals[modalName].closeCallback();
            callback && callback();
        };

        $scope.confirmModal = function (modalName, callback) {
            $scope.currentModal = null;
            $scope.modals[modalName].confirmCallback && $scope.modals[modalName].confirmCallback();
            callback && callback();
        };

        $scope.$on('Esc', function () {
            for (var modalData in $scope.modals)
                $scope.closeModal(modalData);

            // Also close all popups:
            $timeout(function () {
                $('.button_close').click();
            });
        });
        $scope.$on('Enter', function () {
            for (var modalData in $scope.modals)
                if (modalData === $scope.currentModal)
                    $scope.confirmModal(modalData);
        });
        $scope.myCalendar.setCallbacks({
            eventClick: function () {
                $scope.openModal('task');
            },
            select: function () {
                MyEvents.updateEndDateTimeWithDuration();
                $scope.openModal('task');
            },
            eventDrop: function (event, delta, revertFunc, jsEvent) {
                if (event.type === 'floating') {
                    $scope.openModal('floatToFixed');
                    $scope.floatToFixedDelta = delta;
                    $scope.floatToFixedEvent = event;
                    $scope.floatToFixedMethod = 'drop';
                    $scope.floatToFixedRevertFunc = revertFunc;
                }
                else {
                    if (MyEvents.processEventDrop(event, delta))
                        MyEvents.saveEvent(event);
                }
            },
            eventResize: function (event, delta, revertFunc) {
                if (event.type === 'fixed') {
                    event.dur += (delta._data.hours * settings.slotsPerHour);
                    event.dur += (delta._data.minutes / settings.minuteGranularity);
                    MyEvents.handleChangeOfEventType(event);
                    MyEvents.saveEvent(event);
                }
                else if (event.type === 'fixedAllDay') {
                    event.dur += delta.days();
                    MyEvents.handleChangeOfEventType(event);
                    MyEvents.saveEvent(event);
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

        // Cleanup when destroying.
        $scope.$on('$destroy', function () {
            for (var modalData in $scope.modals)
                $scope[modalData + 'Modal'].remove();
        });
    });

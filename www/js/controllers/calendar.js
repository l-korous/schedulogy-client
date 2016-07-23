angular.module('Schedulogy')
    .controller('CalendarCtrl', function ($scope, $ionicModal, settings, MyEvents, $ionicPopover, FullCalendar) {
        /* event source that pulls from google.com */
        $scope.eventSource = {
            url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
            className: 'gcal-event', // an option!
            currentTimezone: 'America/Chicago' // an option!
        };
        $scope.eventSources = [MyEvents.events];

        $scope.fullCalendar = FullCalendar;

        // Popover 'confirm float -> fixed'.
        $ionicModal.fromTemplateUrl('templates/popovers/float_to_fixed.html', {
            scope: $scope,
            animation: 'animated zoomIn'
        }).then(function (popover) {
            $scope.floatToFixedPopover = popover;
        });
        $scope.openFloatToFixedPopover = function ($event) {
            $scope.floatToFixedPopover.show($event);
        };
        $scope.closeFloatToFixedPopover = function (result) {
            $scope.floatToFixedPopover.hide();

            if (result) {
                $scope.floatToFixedEvent.type = 'fixed';

                if ($scope.floatToFixedMethod === 'resize') {
                    $scope.floatToFixedEvent.dur += $scope.floatToFixedDelta.hours();
                    MyEvents.handleChangeOfEventType($scope.floatToFixedEvent);
                }
                else if ($scope.floatToFixedMethod === 'drop') {
                }
                MyEvents.saveEvent($scope.floatToFixedEvent);
            }
            else {
                $scope.floatToFixedRevertFunc();
            }
        };
        $scope.keyUpHandler = function (keyCode) {
            if (keyCode === 13) {
                $scope.closeFloatToFixedPopover(true);
            }
            if (keyCode === 27)
                $scope.closeFloatToFixedPopover(false);
        };

        $scope.fullCalendar.setCallbacks({
            eventClick: function () {
                $scope.openTaskModal();
            },
            select: function () {
                MyEvents.updateEndDateTimeWithDuration();
                $scope.openTaskModal();
            },
            eventDrop: function (event, delta, revertFunc, jsEvent) {
                if (event.type === 'floating') {
                    $scope.openFloatToFixedPopover(jsEvent);
                    $scope.floatToFixedDelta = delta;
                    $scope.floatToFixedEvent = event;
                    $scope.floatToFixedMethod = 'drop';
                    $scope.floatToFixedRevertFunc = revertFunc;
                }
                else
                    MyEvents.saveEvent(event);
            },
            eventResize: function (event, delta, revertFunc, jsEvent) {
                if (event.type === 'fixed') {
                    event.dur += delta.hours();
                    MyEvents.handleChangeOfEventType(event);
                    MyEvents.saveEvent(event);
                }
                else if (event.type === 'fixedAllDay') {
                    event.dur += delta.days();
                    MyEvents.handleChangeOfEventType(event);
                    MyEvents.saveEvent(event);
                }
                else if (event.type === 'floating') {
                    $scope.openFloatToFixedPopover(jsEvent);
                    $scope.floatToFixedDelta = delta;
                    $scope.floatToFixedEvent = event;
                    $scope.floatToFixedMethod = 'resize';
                    $scope.floatToFixedRevertFunc = revertFunc;
                }
            }
        });

        // Popover 'coming soon'.
        $ionicPopover.fromTemplateUrl('templates/popovers/coming_soon.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.comingSoonPopover = popover;
        });
        $scope.openComingSoonPopover = function ($event) {
            $scope.comingSoonPopover.show($event);
        };
        $scope.closeComingSoonPopover = function () {
            $scope.comingSoonPopover.hide();
        };
        // Task edit modal.
        $ionicModal.fromTemplateUrl('templates/popovers/task_modal.html', {
            scope: $scope,
            animation: 'animated zoomIn'
        }).then(function (modal) {
            $scope.taskModal = modal;
        });
        $scope.modalSettings = {
            maxDuration: {
                fixed: 24,
                fixedAllDay: 14,
                floating: settings.endHour - settings.startHour
            }
        };
        $scope.openTaskModal = function (clear) {
            if (!MyEvents.currentEvent || clear) {
                MyEvents.emptyCurrentEvent();
            }

            if (angular.element($('#eventTitleEdit')).scope())
                angular.element($('#eventTitleEdit')).scope().taskSaveForm.$setPristine();
            $scope.taskModal.show().then(function () {
                // This is ugly hack, should be fixed.
                $('#eventTitleEdit').focus();
                $('#eventTitleEdit').select();
            });
        };
        $scope.closeTaskModal = function () {
            $scope.taskModal.hide();
        };

        // Help modal.
        $ionicModal.fromTemplateUrl('templates/popovers/help_modal.html', {
            scope: $scope,
            animation: 'animated zoomIn'
        }).then(function (modal) {
            $scope.helpModal = modal;
        });
        $scope.openHelpModal = function (clear) {
            $scope.helpModal.show();
        };
        $scope.closeHelpModal = function () {
            $scope.helpModal.hide();
        };

        // iCal modal.
        $ionicModal.fromTemplateUrl('templates/popovers/upload_ical_modal.html', {
            scope: $scope,
            animation: 'animated zoomIn'
        }).then(function (modal) {
            $scope.uploadIcalModal = modal;
        });
        $scope.openUploadIcalModal = function () {
            $scope.uploadIcalModal.show();
        };
        $scope.closeUploadIcalModal = function () {
            $scope.uploadIcalModal.hide();
        };

        // Cleanup when destroying.
        $scope.$on('$destroy', function () {
            $scope.comingSoonPopover.remove();
            $scope.taskModal.remove();
        });
    });

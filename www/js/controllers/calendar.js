angular.module('Schedulogy')
    .controller('CalendarCtrl', ['DateUtils', '$scope', '$ionicModal', 'settings', 'MyEvents', 'Event',
        '$window', '$ionicPopover', '$timeout', 'Task', 'moment', 'ionicDatePicker', 'ionicTimePicker', '$filter', '$ionicLoading', 'FullCalendar',
        function (DateUtils, $scope, $ionicModal, settings, MyEvents, Event, $window, $ionicPopover, $timeout,
            Task, moment, ionicDatePicker, ionicTimePicker, $filter, $ionicLoading, FullCalendar) {
            /* event source that pulls from google.com */
            $scope.eventSource = {
                url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
                className: 'gcal-event', // an option!
                currentTimezone: 'America/Chicago' // an option!
            };
            $scope.eventSources = [MyEvents.events];

            $scope.fullCalendar = FullCalendar;
            
            $scope.fullCalendar.setCallbacks({
                eventClick: function () {
                    $scope.openModal();
                },
                select: function () {
                    $scope.updateEndDateTimeWithDuration();
                    $scope.openModal();
                }
            });

            // Popover 'coming soon'.
            $ionicPopover.fromTemplateUrl('templates/popovers/coming_soon.html', {
                scope: $scope
            }).then(function (popover) {
                $scope.comingSoonPopover = popover;
            });
            $scope.openPopover = function ($event) {
                $scope.comingSoonPopover.show($event);
            };
            $scope.closePopover = function () {
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
            $scope.openModal = function (clear) {
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
            $scope.closeModal = function () {
                $scope.taskModal.hide();
            };

            // Cleanup when destroying.
            $scope.$on('$destroy', function () {
                $scope.comingSoonPopover.remove();
                $scope.taskModal.remove();
            });
        }]);

angular.module('Schedulogy')
    .controller('ReminderModalCtrl', function (DateUtils, $scope, constants, MyItems, Item, moment, $rootScope, MyResources, ModalService, $ionicScrollDelegate, $timeout) {
        $scope.myItems = MyItems;
        $scope.myResources = MyResources;
        $scope.popupOpen = false;
        $scope.currentItem = null;
        $scope.data = {showRepetition: false};

        $scope.open = function () {
            $scope.myResources.refresh();

            $scope.currentItem = angular.extend({}, MyItems.currentItem);

            $scope.data.showRepetition = !(!($scope.currentItem.repetition));

            $scope.form.$setPristine();

            ModalService.openModalInternal('reminder', function () {
                $ionicScrollDelegate.scrollTop();
                var primaryInput = $(ModalService.modals.reminder.modalInternal.modalEl).find('#reminderPrimaryInput');
                primaryInput.focus();
                primaryInput.select();

                $(function () {
                    $('#reminderModalTextarea').autogrow();
                    if (!$rootScope.canDoDateTimeInputs) {
                        $("#reminderStartDate").datepicker({
                            onClose: function (dateText, inst) {
                                $scope.currentItem.startDate = dateText;
                                $scope.processStartDateChange();
                            }
                        });

                        $("#reminderStartTime").on('change', function () {
                            $scope.currentItem.startTime = $('#reminderStartTime')[0].value;
                            $scope.processStartDateChange();
                        });

                        $("#reminderStartTime").timepicker({
                            timeFormat: 'H:i'
                        });

                        $("#repetitionEndDate").datepicker({
                            onClose: function (dateText, inst) {
                                $scope.currentItem.repetition.endDate = dateText;
                                $scope.processRepetitionEndDateChange();
                            }
                        });
                    }
                });
            });
        };

        $scope.changeDone = function () {
            $scope.form.$setDirty();
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('reminder', $scope, $scope.open, $scope.close);

        $scope.save = function () {
            $scope.myItems.processSaveRequest($scope.currentItem, function () {
                ModalService.closeModalInternal('reminder');
            }, function () {
                ModalService.closeModalInternal('reminder');
            });
        };

        $scope.switchRepetition = function () {
            if ($scope.currentItem.repetition)
                $scope.currentItem.repetition = null;
            else {
                $scope.currentItem.repetition = constants.defaultRepetition(MyItems.getBTime().clone());
                Item.setRepetitionEnd($scope.currentItem);
            }
        };

        $scope.processStartDateChange = function () {
            Item.setStartFromDateAndTime($scope.currentItem);
            $scope.form.$setDirty();
        };

        $scope.processRepetitionEndDateChange = function () {
            Item.setRepetitionEndFromDate($scope.currentItem);
            $scope.form.repetitionEndDate.$setDirty();
        };

        $scope.remove = function () {
            $scope.myItems.processDeleteRequest($scope.myItems.currentItem._id, function () {
                ModalService.closeModalInternal('reminder');
            }, function () {
                ModalService.closeModalInternal('reminder');
            });
        };

        $scope.startValueForOrderingOfDependencies = function (event) {
            return event.start.unix();
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'reminder') {
                if ($scope.popupOpen) {
                    $timeout(function () {
                        $('.button_close').click();
                    });
                } else {
                    $scope.close();
                }
            }
        });

        $scope.$on('$destroy', function () {
            ModalService.modals.reminder.modal.remove();
        });
    });

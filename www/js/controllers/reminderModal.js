angular.module('Schedulogy')
    .controller('ReminderModalCtrl', function (DateUtils, $scope, constants, MyItems, Item, moment, Notification, MyResources, ModalService, $ionicScrollDelegate, ionicDatePicker) {
        $scope.myItems = MyItems;
        $scope.myResources = MyResources;
        $scope.currentItem = null;
        $scope.data = {showRepetition: false};

        $scope.open = function () {
            $scope.myResources.refresh();

            $scope.currentItem = angular.extend({}, MyItems.currentItem);

            $scope.data.showRepetition = false;

            $scope.form.$setPristine();

            ModalService.openModalInternal('reminder', function () {
                $ionicScrollDelegate.scrollTop();
                var primaryInput = $(ModalService.modals.reminder.modalInternal.modalEl).find('#reminderPrimaryInput');
                primaryInput.focus();
                primaryInput.select();

                $(function () {
                    $('#reminderModalTextarea').autogrow();
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
            $scope.myItems.saveItem($scope.currentItem, function () {
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

        $scope.datePicker = {
            start: {
                callback: function (val) {
                    $scope.currentItem.start = DateUtils.pushDatePart(moment(val), $scope.currentItem.start);
                    Item.setStart($scope.currentItem);
                    $scope.form.$setDirty();
                }
            },
            repetitionEnd: {
                callback: function (val) {
                    $scope.currentItem.repetition.end = DateUtils.pushDatePart(moment(val), $scope.currentItem.repetition.end);
                    Item.setRepetitionEnd($scope.currentItem);
                    $scope.form.$setDirty();
                }
            }
        };

        $scope.openDatePicker = function (which) {
            $scope.popupOpen = true;

            if (which === 'start') {
                $scope.datePicker.start.inputDate = $scope.currentItem ? $scope.currentItem.start.toDate() : MyItems.getBTime();
                ionicDatePicker.openDatePicker($scope.datePicker[which]);
            }
            if (which === 'repetitionEnd') {
                $scope.datePicker.repetitionEnd.inputDate = $scope.currentItem ? $scope.currentItem.repetition.end.toDate() : MyItems.getBTime().clone().add(constants.defaultMonthsUntil, 'months');
                ionicDatePicker.openDatePicker($scope.datePicker[which]);
            }
        };

        $scope.remove = function () {
            $scope.myItems.deleteItemById($scope.myItems.currentItem._id, function () {
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
                $scope.close();
            }
        });

        $scope.$on('$destroy', function () {
            ModalService.modals.reminder.modal.remove();
        });
    });

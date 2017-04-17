angular.module('Schedulogy')
    .controller('ReminderModalCtrl', function (DateUtils, $scope, constants, MyItems, Item, moment, Notification, MyResources, ModalService, $ionicScrollDelegate, $timeout) {
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

        $scope.processStartDateChange = function() {
            $scope.currentItem.start = moment($scope.currentItem.startDate);
            Item.setStart($scope.currentItem);
            $scope.form.$setDirty();
        };
        
        $scope.processRepetitionEndDateChange = function() {
            $scope.currentItem.repetition.end = moment($scope.currentItem.repetition.endDate);
            Item.setRepetitionEnd($scope.currentItem);
            $scope.form.endDate.$setDirty();
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

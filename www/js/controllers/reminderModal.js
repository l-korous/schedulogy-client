angular.module('Schedulogy')
    .controller('ReminderModalCtrl', function (DateUtils, $scope, settings, MyItems, Item, moment, Notification, MyResources, ModalService, $ionicScrollDelegate) {
        $scope.myItems = MyItems;
        $scope.myResources = MyResources;
        $scope.currentItem = null;

        $scope.open = function () {
            $scope.myResources.refresh();

            $scope.currentItem = angular.extend({}, MyItems.currentItem);

            $scope.form.$setPristine();

            ModalService.openModalInternal('reminder', function () {
                $ionicScrollDelegate.scrollTop();
                var primaryInput = $(ModalService.modals.reminder.modalInternal.modalEl).find('#primaryInput');
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

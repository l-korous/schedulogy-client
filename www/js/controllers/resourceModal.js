angular.module('Schedulogy')
    .controller('ResourceModalCtrl', function (MyResources, $scope, settings, ModalService, MyEvents) {
        $scope.settings = settings;
        $scope.loading = true;
        $scope.currentResource = null;

        $scope.open = function () {
            if (!MyResources.currentResource)
                MyResources.emptyCurrentResource();
            else
                MyResources.updateAllTexts();

            $scope.currentResource = angular.extend({}, MyResources.currentResource);

            var focusPrimaryInputAndSetPristine = function () {
                var primaryInput = $(ModalService.modals.resource.modalInternal.modalEl).find('#primaryInput');
                primaryInput.focus();
                primaryInput.select();
                $scope.form.$setPristine();
            };

            ModalService.openModalInternal('resource', focusPrimaryInputAndSetPristine);
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('resource', $scope, $scope.open, $scope.close);

        $scope.save = function () {
            if ($scope.form.$invalid)
                return;
            angular.extend(MyResources.currentResource, $scope.currentResource);
            MyResources.saveResource(function () {
                ModalService.closeModalInternal(function () {
                    MyEvents.refresh();
                });
            });
        };

        $scope.$watch('myResources.currentResource.sinceDay', function (newValue, oldValue) {
            if (oldValue) {
                if (newValue > MyResources.currentResource.untilDay)
                    MyResources.currentResource.sinceDay = oldValue;
                else
                    MyResources.updateText('sinceDay');
            }
        });

        $scope.$watch('myResources.currentResource.untilDay', function (newValue, oldValue) {
            if (oldValue) {
                if (MyResources.currentResource.sinceDay > newValue)
                    MyResources.currentResource.untilDay = oldValue;
                else
                    MyResources.updateText('untilDay');
            }
        });

        $scope.$watch('myResources.currentResource.sinceTime', function (newValue, oldValue) {
            if (oldValue) {
                if (newValue > MyResources.currentResource.untilTime)
                    MyResources.currentResource.sinceTime = oldValue;
                else
                    MyResources.updateText('sinceTime');
            }
        });

        $scope.$watch('myResources.currentResource.untilTime', function (newValue, oldValue) {
            if (oldValue) {
                if (MyResources.currentResource.sinceTime > newValue)
                    MyResources.currentResource.untilTime = oldValue;

                else
                    MyResources.updateText('untilTime');
            }
        });

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'resource')
                $scope.close();
        });

        $scope.$on('Enter', function () {
            if (ModalService.currentModal === 'resource')
                $scope.save();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals.resource.modal.remove();
        });
    });

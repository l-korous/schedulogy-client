angular.module('Schedulogy')
    .controller('ResourceModalCtrl', function (MyResources, $scope, settings, ModalService, MyEvents) {
        $scope.myResources = MyResources;
        $scope.settings = settings;
        $scope.loading = true;

        ModalService.createModal('resource', $scope, {}, $scope.open, $scope.close);

        $scope.open = function () {
            if (!$scope.myResources.currentResource) {
                $scope.myResources.emptyCurrentResource();
                $scope.newResource = true;
            }
            else
                $scope.myResources.updateAllTexts();

            var focusPrimaryInputAndSetPristine = function () {
                var primaryInput = $(ModalService.modals.resource.modal.modalEl).find('#primaryInput');
                primaryInput.focus();
                primaryInput.select();
                $scope.form.$setPristine();
            };

            ModalService.openModalInternal('resource', focusPrimaryInputAndSetPristine);
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        $scope.save = function () {
            if ($scope.form.$invalid)
                return;
            $scope.myResources.saveUser(function () {
                ModalService.closeModalInternal(function () {
                    MyEvents.refresh();
                });
            });
        };

        $scope.removeResource = function (resourceToReplaceCurrentWith) {
            $scope.myResources.removeResource(resourceToReplaceCurrentWith, function () {
                ModalService.closeModalInternal(function () {
                    MyEvents.refresh();
                    $scope.resourceToReplaceCurrentWith = null;
                });
            });
        };

        $scope.$watch('myResources.currentResource.sinceDay', function (newValue, oldValue) {
            if (oldValue) {
                if (newValue > $scope.myResources.currentResource.untilDay)
                    $scope.myResources.currentResource.sinceDay = oldValue;
                else
                    $scope.myResources.updateText('sinceDay');
            }
        });

        $scope.$watch('myResources.currentResource.untilDay', function (newValue, oldValue) {
            if (oldValue) {
                if ($scope.myResources.currentResource.sinceDay > newValue)
                    $scope.myResources.currentResource.untilDay = oldValue;
                else
                    $scope.myResources.updateText('untilDay');
            }
        });

        $scope.$watch('myResources.currentResource.sinceTime', function (newValue, oldValue) {
            if (oldValue) {
                if (newValue > $scope.myResources.currentResource.untilTime)
                    $scope.myResources.currentResource.sinceTime = oldValue;
                else
                    $scope.myResources.updateText('sinceTime');
            }
        });

        $scope.$watch('myResources.currentResource.untilTime', function (newValue, oldValue) {
            if (oldValue) {
                if ($scope.myResources.currentResource.sinceTime > newValue)
                    $scope.myResources.currentResource.untilTime = oldValue;

                else
                    $scope.myResources.updateText('untilTime');
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

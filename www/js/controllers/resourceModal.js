angular.module('Schedulogy')
    .controller('ResourceModalCtrl', function (MyResources, $scope, ModalService, MyItems, Resource) {
        $scope.loading = true;
        $scope.currentResource = null;

        $scope.open = function () {
            $scope.currentResource = angular.extend(new Resource, MyResources.currentResource);
            MyResources.updateAllTexts($scope.currentResource);

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
            MyResources.saveResource($scope.currentResource, function () {
                ModalService.closeModalInternal();
                MyItems.refresh();
            });
        };

        $scope.$watch('currentResource.sinceDay', function (newValue, oldValue) {
            if (oldValue || (oldValue === 0)) {
                if (newValue > MyResources.currentResource.untilDay)
                    MyResources.currentResource.sinceDay = oldValue;
                else
                    MyResources.updateText($scope.currentResource, 'sinceDay');
            }
        });

        $scope.$watch('currentResource.untilDay', function (newValue, oldValue) {
            if (oldValue || (oldValue === 0)) {
                if (MyResources.currentResource.sinceDay > newValue)
                    MyResources.currentResource.untilDay = oldValue;
                else
                    MyResources.updateText($scope.currentResource, 'untilDay');
            }
        });

        $scope.$watch('currentResource.sinceTime', function (newValue, oldValue) {
            if (oldValue || (oldValue === 0)) {
                if (newValue > MyResources.currentResource.untilTime)
                    MyResources.currentResource.sinceTime = oldValue;
                else
                    MyResources.updateText($scope.currentResource, 'sinceTime');
            }
        });

        $scope.$watch('currentResource.untilTime', function (newValue, oldValue) {
            if (oldValue || (oldValue === 0)) {
                if (MyResources.currentResource.sinceTime > newValue)
                    MyResources.currentResource.untilTime = oldValue;

                else
                    MyResources.updateText($scope.currentResource, 'untilTime');
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

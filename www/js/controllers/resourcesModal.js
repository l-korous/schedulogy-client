angular.module('Schedulogy')
    .controller('ResourcesModalCtrl', function (MyResources, $scope, $ionicModal, settings) {
        $scope.myResources = MyResources;
        $scope.settings = settings;
        $scope.loading = true;

        // Register self in parent (leftMenu).
        $scope.$parent.modalScope.resources = $scope;
        $scope.init = function () {
            $scope.loading = true;
            $scope.myResources.refresh(function () {
                $scope.loading = false;
            });
            // This is used in main.js to indicate whether we need to refresh events upon closing of this modal.
            $scope.eventRefreshNeeded = false;
        };

        $scope.closeSelf = function () {
            $scope.$parent.closeModal('resources');
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

        $ionicModal.fromTemplateUrl('templates/resourceModal.html', {
            scope: $scope,
            animation: 'animated zoomIn'
        }).then(function (modal) {
            $scope.detailModal = modal;
        });

        $scope.openDetailModal = function (resource) {
            if (resource) {
                $scope.myResources.currentResource = resource;
                $scope.myResources.updateAllTexts();
            }
            else
                $scope.myResources.emptyCurrentResource();

            var focusPrimaryInputAndSetPristine = function () {
                var primaryInput = $($scope.detailModal.modalEl).find('#primaryInput');
                primaryInput.focus();
                primaryInput.select();
                angular.element(primaryInput).scope().resourceSaveForm.$setPristine();
            };

            $scope.detailModal.show().then(function () {
                focusPrimaryInputAndSetPristine();
                $scope.myResources.registerSaveCallback(function () {
                    $scope.closeDetailModal();
                    $scope.eventRefreshNeeded = true;
                });
                
                $scope.myResources.registerRemoveCallback(function () {
                    $scope.closeDetailModal();
                    $scope.eventRefreshNeeded = true;
                    $scope.resourceToReplaceCurrentWith = null;
                });
            });
        };

        $scope.closeDetailModal = function () {
            $scope.detailModal.hide();
            $scope.loading = true;
            $scope.myResources.refresh(function () {
                $scope.loading = false;
            });
            $scope.myResources.registerSaveCallback(null);
            $scope.myResources.registerRemoveCallback(null);
        };

        $scope.$on('$destroy', function () {
            $scope.detailModal.remove();
        });
    });

angular.module('Schedulogy')
    .controller('ResourcesModalCtrl', function (Resource, $scope, MyEvents, $ionicModal, DateUtils, settings) {
        $scope.resources = [];
        $scope.settings = settings;

        $scope.refreshResources = function () {
            Resource.query({btime: MyEvents.getBTime().unix()}, function (data) {
                $scope.resources = data.resourcesLocal;
            }, function (err) {
                console.log('Resource.query - error');
            });
        };

        $scope.saveResource = function () {
            $scope.currentResource.$save({btime: MyEvents.getBTime().unix()}, function (data) {
                $scope.closeDetailModal();
                $scope.resources = data.resourcesLocal;
            });
        };

        $scope.removeResource = function (resource) {
            resource.$remove({btime: MyEvents.getBTime().unix(), resourceId: resource._id}, function (data) {
                $scope.closeDetailModal();
                $scope.resources = data.resourcesLocal;
            });
        };

        $scope.closeSelf = function () {
            $scope.$parent.closeModal('resources');
        };

        $scope.emptyCurrentResource = function () {
            $scope.currentResource = angular.extend(new Resource(), {
                type: 'artificial',
                sinceDay: 1,
                untilDay: 7,
                sinceTime: 0,
                untilTime: 24 * settings.slotsPerHour
            });
            $scope.updateAllTexts();
        };

        $scope.$watch('currentResource.sinceDay', function (newValue, oldValue) {
            if (oldValue) {
                if (newValue > $scope.currentResource.untilDay)
                    $scope.currentResource.sinceDay = oldValue;
                else
                    $scope.updateText('sinceDay');
            }
        });

        $scope.$watch('currentResource.untilDay', function (newValue, oldValue) {
            if (oldValue) {
                if ($scope.currentResource.sinceDay > newValue)
                    $scope.currentResource.untilDay = oldValue;
                else
                    $scope.updateText('untilDay');
            }
        });

        $scope.$watch('currentResource.sinceTime', function (newValue, oldValue) {
            if (oldValue) {
                if (newValue > $scope.currentResource.untilTime)
                    $scope.currentResource.sinceTime = oldValue;
                else
                    $scope.updateText('sinceTime');
            }
        });

        $scope.$watch('currentResource.untilTime', function (newValue, oldValue) {
            if (oldValue) {
                if ($scope.currentResource.sinceTime > newValue)
                    $scope.currentResource.untilTime = oldValue;

                else
                    $scope.updateText('untilTime');
            }
        });

        $scope.updateText = function (identifier) {
            switch (identifier) {
                case 'sinceDay':
                    $scope.currentResource.sinceDayText = DateUtils.getDayName($scope.currentResource.sinceDay);
                    break;
                case 'untilDay':
                    $scope.currentResource.untilDayText = DateUtils.getDayName($scope.currentResource.untilDay);
                    break;
                case 'sinceTime':
                    $scope.currentResource.sinceTimeText = DateUtils.getTimeFromSlotCount($scope.currentResource.sinceTime);
                    break;
                case 'untilTime':
                    $scope.currentResource.untilTimeText = DateUtils.getTimeFromSlotCount($scope.currentResource.untilTime);
                    break;
            }
        };

        $scope.updateAllTexts = function () {
            $scope.updateText('sinceDay');
            $scope.updateText('untilDay');
            $scope.updateText('sinceTime');
            $scope.updateText('untilTime');
        };

        $ionicModal.fromTemplateUrl('templates/resourceModal.html', {
            scope: $scope,
            animation: 'animated zoomIn'
        }).then(function (modal) {
            $scope.detailModal = modal;
        });

        $scope.openDetailModal = function (resource) {
            if (resource) {
                $scope.currentResource = resource;
                $scope.updateAllTexts();
            }
            else
                $scope.emptyCurrentResource();

            var focusPrimaryInput = function () {
                var primaryInput = $($scope.detailModal.modalEl).find('#primaryInput');
                primaryInput.focus();
                primaryInput.select();
            };


            $scope.detailModal.show().then(function () {
                focusPrimaryInput();
            });
        };

        $scope.closeDetailModal = function () {
            $scope.detailModal.hide();
        };

        $scope.refreshResources();

        $scope.$on('$destroy', function () {
            $scope.detailModal.remove();
        });

    });

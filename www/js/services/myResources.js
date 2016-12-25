angular.module('Schedulogy')
    .service('MyResources', function (settings, DateUtils, Resource, $rootScope, MyItems, moment) {
        var _this = this;
        _this.resources = [];

        _this.saveCallback = null;
        _this.registerSaveCallback = function (callback) {
            _this.saveCallback = callback;
        };

        _this.removeCallback = null;
        _this.registerRemoveCallback = function (callback) {
            _this.removeCallback = callback;
        };

        _this.importData = function (resourcesData) {
            _this.resources = resourcesData;
            if (_this.currentResource && _this.currentResource._id) {
                var resourceToSet = _this.resources.find(function (resource) {
                    return resource._id === _this.currentResource._id;
                });
                if (resourceToSet)
                    _this.currentResource = resourceToSet;
            }
        };

        _this.refresh = function (callback) {
            Resource.query({}, function (data) {
                _this.importData(data.resourcesLocal);
                $rootScope.myResourceId = _this.getMyResourceId();
                callback && callback();
            }, function (err) {
                console.log('Resource.query - error');
            });
        };

        _this.getMyResourceId = function () {
            if (!$rootScope.currentUser.resourceId)
                $rootScope.currentUser.resourceId = _this.getResourceByUserId($rootScope.currentUser._id)._id;

            return $rootScope.currentUser.resourceId;
        };

        _this.getResourceByUserId = function (userId) {
            var theResources = _this.resources.filter(function (res) {
                return (res.type === 'user') && (res.user = userId);
            });
            return theResources[0];
        };

        _this.saveResource = function (passedResource, successCallback, errorCallback) {
            var resource = passedResource || _this.currentResource;
            $rootScope.isLoading = true;
            resource.$save({btime: MyItems.getBTime().unix()}, function (data) {
                _this.importData(data.resourcesLocal);
                successCallback && successCallback();
                $rootScope.isLoading = false;
            }, function (err) {
                console.log('saveResource error: ' + err);
                errorCallback && errorCallback();
                $rootScope.isLoading = false;
            });
        };

        _this.removeResource = function (passedResource, replacementResourceId, successCallback, errorCallback) {
            var resource = passedResource || _this.currentResource;
            resource.$remove({resourceId: resource._id, btime: MyItems.getBTime().unix(), replacementResourceId: replacementResourceId}, function (data) {
                _this.importData(data.resourcesLocal);
                successCallback && successCallback();
            }, function (err) {
                console.log('removeResource error: ' + err);
                errorCallback && errorCallback();
            });
        };

        _this.emptyCurrentResource = function () {
            _this.currentResource = angular.extend(new Resource(), {
                type: 'artificial',
                sinceDay: 1,
                untilDay: 7,
                sinceTime: 0,
                untilTime: 24 * settings.slotsPerHour,
                timeZone: moment.tz.guess()
            });
            _this.updateAllTexts();
        };

        _this.updateText = function (passedResource, identifier) {
            var resource = passedResource || _this.currentResource;
            switch (identifier) {
                case 'sinceDay':
                    resource.sinceDayText = DateUtils.getDayName(resource.sinceDay);
                    break;
                case 'untilDay':
                    resource.untilDayText = DateUtils.getDayName(resource.untilDay);
                    break;
                case 'sinceTime':
                    resource.sinceTimeText = DateUtils.getTimeFromSlotCount(resource.sinceTime);
                    break;
                case 'untilTime':
                    resource.untilTimeText = DateUtils.getTimeFromSlotCount(resource.untilTime);
                    break;
            }
        };

        _this.updateAllTexts = function (passedResource) {
            var resource = passedResource || _this.currentResource;
            _this.updateText(resource, 'sinceDay');
            _this.updateText(resource, 'untilDay');
            _this.updateText(resource, 'sinceTime');
            _this.updateText(resource, 'untilTime');
        };
    });

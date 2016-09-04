angular.module('Schedulogy')
    .service('MyResources', function (settings, DateUtils, Resource, $rootScope, MyEvents) {
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
            if (!$rootScope.currentUser.resourceId) {
                var theResources = _this.resources.filter(function (res) {
                    return (res.type === 'user') && (res.user = $rootScope.currentUser._id);
                });
                $rootScope.currentUser.resourceId = theResources[0]._id;
            }
            return $rootScope.currentUser.resourceId;
        };

        _this.saveResource = function (successCallback, errorCallback) {
            _this.currentResource.$save({btime: MyEvents.getBTime().unix()}, function (data) {
                _this.importData(data.resourcesLocal);
                successCallback && successCallback();
            }, function(err) {
                console.log('saveResource error: ' + err);
                errorCallback && errorCallback();
            });
        };

        _this.removeResource = function (replacementResourceId, successCallback, errorCallback) {
            _this.currentResource.$remove({resourceId: _this.currentResource._id, btime: MyEvents.getBTime().unix(), replacementResourceId: replacementResourceId}, function (data) {
                _this.importData(data.resourcesLocal);
                successCallback && successCallback();
            }, function(err) {
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
                untilTime: 24 * settings.slotsPerHour
            });
            _this.updateAllTexts();
        };

        _this.updateText = function (identifier) {
            switch (identifier) {
                case 'sinceDay':
                    _this.currentResource.sinceDayText = DateUtils.getDayName(_this.currentResource.sinceDay);
                    break;
                case 'untilDay':
                    _this.currentResource.untilDayText = DateUtils.getDayName(_this.currentResource.untilDay);
                    break;
                case 'sinceTime':
                    _this.currentResource.sinceTimeText = DateUtils.getTimeFromSlotCount(_this.currentResource.sinceTime);
                    break;
                case 'untilTime':
                    _this.currentResource.untilTimeText = DateUtils.getTimeFromSlotCount(_this.currentResource.untilTime);
                    break;
            }
        };

        _this.updateAllTexts = function () {
            _this.updateText('sinceDay');
            _this.updateText('untilDay');
            _this.updateText('sinceTime');
            _this.updateText('untilTime');
        };
    });

angular.module('Schedulogy')
    .service('MyUsers', function (MyEvents, User, settings, $rootScope) {
        var _this = this;
        _this.users = [];

        _this.saveCallback = null;
        _this.registerSaveCallback = function (callback) {
            _this.saveCallback = callback;
        };

        _this.refresh = function (callback) {
            User.query({btime: MyEvents.getBTime().unix()}, function (data) {
                _this.users = data.usersLocal;
                callback && callback();
            }, function (err) {
                console.log('User.query - error');
            });
        };

        _this.saveUser = function (successCallback, errorCallback) {
            $rootScope.isLoading = true;
            // TODO This is not the best place for this.
            if (_this.currentUser.admin)
                _this.currentUser.role = 'admin';
            _this.currentUser.$save({}, function (data) {
                _this.users = data.usersLocal;
                successCallback && successCallback();
                $rootScope.isLoading = false;
            }, function (data) {
                _this.users = data.usersLocal;
                $rootScope.isLoading = false;
                errorCallback && errorCallback(data.error);
            });
        };

        _this.removeUser = function (user, successCallback, errorCallback) {
            user.$remove({userId: user._id}, function (data) {
                _this.users = data.usersLocal;
                successCallback && successCallback();
            }, function (err) {
                errorCallback && errorCallback();
            });
        };

        _this.emptyCurrentUser = function () {
            _this.currentUser = angular.extend(new User(), {
                email: ''
            });
        };
    });

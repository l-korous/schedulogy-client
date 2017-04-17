angular.module('Schedulogy')
    .service('MyUsers', function (MyItems, User, $rootScope) {
        var _this = this;
        _this.users = [];
        _this.tenantCode = null;
        _this.originalTenantCode = null;

        _this.saveCallback = null;
        _this.registerSaveCallback = function (callback) {
            _this.saveCallback = callback;
        };

        _this.refresh = function (callback) {
            $('#theOnlyCalendar').fullCalendar('startRefreshingSpinner');
            User.query({btime: MyItems.getBTime().unix()}, function (data) {
                _this.users = data.usersLocal;
                _this.tenantCode = data.params.tenantCode;
                _this.originalTenantCode = data.params.originalTenantCode;
                $('#theOnlyCalendar').fullCalendar('stopRefreshingSpinner');
                callback && callback();
            }, function (err) {
                console.log('User.query - error');
                $('#theOnlyCalendar').fullCalendar('stopRefreshingSpinner');
            });
        };

        _this.saveUser = function (successCallback, errorCallback) {
            $('#theOnlyCalendar').fullCalendar('startRefreshingSpinner');

            // TODO This is not the best place for this.
            if (_this.currentUser.admin)
                _this.currentUser.role = 'admin';
            _this.currentUser.$save({}, function (data) {
                _this.users = data.usersLocal;
                successCallback && successCallback();
                $('#theOnlyCalendar').fullCalendar('stopRefreshingSpinner');
            }, function (data) {
                _this.users = data.usersLocal;
                $('#theOnlyCalendar').fullCalendar('stopRefreshingSpinner');
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

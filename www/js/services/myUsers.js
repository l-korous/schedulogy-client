angular.module('Schedulogy')
    .service('MyUsers', function (MyEvents, User) {
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

        _this.saveUser = function () {
            // TODO This is not the best place for this.
            if(_this.currentUser.admin)
                _this.currentUser.role = 'admin';
            _this.currentUser.$save({}, function (data) {
                _this.users = data.usersLocal;
                _this.saveCallback && _this.saveCallback();
            });
        };

        _this.removeUser = function (user) {
            user.$remove({userId: user._id}, function (data) {
                _this.users = data.usersLocal;
            });
        };

        _this.emptyCurrentUser = function () {
            _this.currentUser = angular.extend(new User(), {
                email: ''
            });
        };
    });

angular.module('Schedulogy')
    .factory('Notification', function ($window, $ionicPlatform) {
        var inBackground = false;
        $ionicPlatform.ready(function () {
            try {
                $window.plugin.notification.local.setDefaults({
                    title: 'Schedulogy',
                    text: 'Task',
                    sound: null,
                    icon: 'res://drawable-xxxhdpi/icon',
                    smallIcon: 'res://drawable-xxxhdpi/icon'
                });
                $window.plugin.notification.local.on('click', function (notification) {
                    // callbacker.trigger('click', JSON.parse(notification.data || '{}'));
                });
            } catch (e) {
            }
        });
        $ionicPlatform.on("pause", function () {
            inBackground = true;
        });
        $ionicPlatform.on("resume", function () {
            inBackground = false;
            try {
                $window.plugin.notification.local.clearAll();
            } catch (e) {
            }
        });
        return {
            add: function (data) {
                inBackground && this.addAlways(data);
            },
            addAlways: function (data) {
                data = angular.extend({}, data);
                data.id = data.id || this.createId();
                try {
                    $window.plugin.notification.local.schedule(data);
                } catch (e) {
                }
            },
            clear: function (notificationID) {
                try {
                    $window.plugin.notification.local.clear(notificationID);
                } catch (e) {
                }
            },
            createId: function () {
                return Math.floor(Math.random() * 1e9) + 1;
            },
            onClick: function (callback) {
                //callbacker.on('click', callback);
            },
            offClick: function (callback) {
                //callbacker.off('click', callback);
            },
            shortToast: function (text) {
                try {
                    $window.toast.showShort(text);
                } catch (e) {
                    $window.alert(text);
                }
            },
            longToast: function (text) {
                try {
                    $window.toast.showLong(text);
                } catch (e) {
                    $window.alert(text);
                }
            },
            cancelToast: function () {
                try {
                    $window.toast.cancel();
                } catch (e) {
                }
            }
        };
    });
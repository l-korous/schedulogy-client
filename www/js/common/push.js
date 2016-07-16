angular.module("MyLift")
    .run(function(Push, $settings, Auth) {
        Push.init().then(function(token) {
            $settings.pushToken = token;
            if (Auth.isAuthenticated()) {
                Auth.changePushToken();
            }
        });
    })
    .factory("Push", function($ionicPlatform, $settings, CustomCallbacker, $q) {
        var callbacker = new CustomCallbacker();
        return {
            init: function() {
                var defer = $q.defer();
                $ionicPlatform.ready(function() {
                    if (ionic.Platform.isAndroid()) {
                        var push = new Ionic.Push({
                            debug: false,
                            onNotification: function(notification) {
                                var payload = notification.payload;
                                callbacker.trigger(payload.type, notification, payload);
                            },
                            pluginConfig: {
                                android: {
                                    iconColor: $settings.color
                                }
                            }
                        });
                        push.register(function(data) {
                            defer.resolve(data && data.token);
                        });
                    } else {
                        defer.reject();
                    }
                });
                return defer.promise;
            },
            on: _.bind(callbacker.on, callbacker),
            off: _.bind(callbacker.off, callbacker)
        };
    });

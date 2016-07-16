angular.module('Schedulogy')
        .factory('Cordova', ['$window', '$q',
            function ($window, $q) {
                return {
                    isAndroid: function () {
                        return $window.ionic.Platform.isAndroid();
                    },
                    isAndroid44: function () {
                        return this.isAndroid() && $window.ionic.Platform.version().toString().indexOf('4.4') === 0;
                    },
                    isIos: function () {
                        return $window.ionic.Platform.isIOS() || $window.ionic.Platform.isIPad();
                    },
                    copyToClipboard: function (text) {
                        var defer = $q.defer();
                        try {
                            $window.cordova.plugins.clipboard.copy(text, function () {
                                defer.resolve();
                            }, function () {
                                defer.reject();
                            });
                        } catch (e) {
                            defer.reject();
                        }
                        return defer.promise;
                    },
                    openMap: function (address) {
                        var defer = $q.defer();
                        try {
                            $window.cordova.InAppBrowser.open("geo:0,0?q=" + encodeURIComponent(address), "_system", "");
                            defer.resolve();
                        } catch (e) {
                            $window.open("http://maps.google.com/?q=" + encodeURIComponent(address), "_blank", "");
                            defer.resolve();
                        }
                        return defer.promise;
                    },
                    openNavigation: function (address) {
                        var defer = $q.defer();
                        try {
                            $window.launchnavigator.navigate(address, null, function() {
                                    defer.resolve();
                                }, function(error) {
                                    defer.reject(error);
                                }, {
                                    navigationMode: "turn-by-turn",
                                    transportMode: "driving",
                                    disableAutoGeolocation: true
                                }
                            );
                        } catch (e) {
                            $window.open("http://maps.google.com/maps?daddr=" + encodeURIComponent(address), "_blank", "");
                            defer.resolve();
                        }
                        return defer.promise;
                    },
                    call: function (number) {
                        var defer = $q.defer();
                        try {
                            $window.cordova.InAppBrowser.open("tel:" + encodeURIComponent(number), "_system", "");
                            defer.resolve();
                        } catch (e) {
                            $window.open("tel:" + encodeURIComponent(number), "_blank", "");
                            defer.resolve();
                        }
                        return defer.promise;
                    },
                    sendSms: function (number) {
                        var defer = $q.defer();
                        try {
                            $window.cordova.InAppBrowser.open("sms:" + encodeURIComponent(number), "_system", "");
                            defer.resolve();
                        } catch (e) {
                            $window.open("sms:" + encodeURIComponent(number), "_blank", "");
                            defer.resolve();
                        }
                        return defer.promise;
                    },
                    sendEmail: function (email) {
                        var defer = $q.defer();
                        try {
                            $window.cordova.InAppBrowser.open("mailto:" + encodeURIComponent(email), "_system", "");
                            defer.resolve();
                        } catch (e) {
                            $window.open("mailto:" + encodeURIComponent(email), "_blank", "");
                            defer.resolve();
                        }
                        return defer.promise;
                    },
                    getCoords: function () {
                        var defer = $q.defer();
                        try {
                            $window.navigator.geolocation.getCurrentPosition(function(position) {
                                if (position && position.coords) {
                                    defer.resolve({lat: position.coords.latitude, lng: position.coords.longitude});
                                } else {
                                    defer.reject();
                                }
                            }, function(error) {
                                defer.reject(error);
                            }, {
                                maximumAge: 6e5,
                                timeout: 1e4,
                                enableHighAccuracy: false
                            });
                        } catch (e) {
                            defer.reject(e);
                        }
                        return defer.promise;
                    },
                    getDistance: function (lat1, lon1, lat2, lon2) {
                        var R = 6371000;
                        var φ1 = lat1 * Math.PI / 180;
                        var φ2 = lat2 * Math.PI / 180;
                        var Δλ = (lon2 - lon1) * Math.PI / 180;
                        var x = Δλ * Math.cos((φ1 + φ2) / 2);
                        var y = (φ2 - φ1);
                        var d = Math.sqrt(x * x + y * y) * R;
                        return Math.round(d);
                    }
                };
            }]);

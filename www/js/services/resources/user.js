angular.module('Schedulogy')
    .factory('User', function ($resource, $http, settings) {
        var User = $resource(settings.serverUrl + "/users", {}, {
            save: {
                method: "POST"
            }
        });

        return User;
    });
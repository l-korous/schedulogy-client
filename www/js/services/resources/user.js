angular.module('Secretary')
    .factory('User', function ($resource, $http, serverUrl) {
        var User = $resource(serverUrl + "/users", {}, {
            save: {
                method: "POST"
            }
        });

        return User;
    });
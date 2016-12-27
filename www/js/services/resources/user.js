angular.module('Schedulogy')
    .factory('User', function ($resource, settings, $http) {
        var User = $resource(settings.serverUrl + "/user", {}, {
            query: {
                method: "GET",
                url: settings.serverUrl + "/user",
                transformResponse: $http.defaults.transformResponse.concat([unserializeArray])
            },
            get: {
                method: "GET",
                url: settings.serverUrl + "/user/:userId",
                transformResponse: $http.defaults.transformResponse.concat([unserialize])
            },
            save: {
                method: "POST",
                url: settings.serverUrl + "/user/:userId",
                transformResponse: $http.defaults.transformResponse.concat([unserializeArray])
            },
            loginSocial: {
                method: "POST",
                url: settings.serverUrl + "/loginSocial"
            },
            remove: {
                method: "DELETE",
                url: settings.serverUrl + "/user/:userId",
                params: {
                    userId: "@userId"
                },
                transformResponse: $http.defaults.transformResponse.concat([unserializeArray])
            }
        });

        function unserialize(user) {
            user.admin = (user.role === 'admin');
            return angular.extend(new User(), user);
        }

        function unserializeArray(userArray) {
            if (userArray.users) {
                userArray.usersLocal = [];
                userArray.users.forEach(function (user) {
                    userArray.usersLocal.push(unserialize(user));
                });

                return userArray;
            }
        }

        User.unserialize = unserialize;

        return User;
    });
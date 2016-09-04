angular.module('Schedulogy')
    .factory('Resource', function ($resource, settings, $http) {
        var Resource = $resource(settings.serverUrl + "/resource", {}, {
            query: {
                method: "GET",
                url: settings.serverUrl + "/resource",
                transformResponse: $http.defaults.transformResponse.concat([unserializeArray])
            },
            get: {
                method: "GET",
                url: settings.serverUrl + "/resource/:resourceId",
                transformResponse: $http.defaults.transformResponse.concat([unserialize])
            },
            save: {
                method: "POST",
                transformRequest: [serialize].concat($http.defaults.transformRequest),
                transformResponse: $http.defaults.transformResponse.concat([unserializeArray]),
                params: {
                    btime: '@btime'
                }
            },
            remove: {
                method: "DELETE",
                url: settings.serverUrl + "/resource/:resourceId",
                params: {
                    resourceId: "@resourceId",
                    btime: '@btime',
                    replacementResourceId: "@replacementResourceId"
                },
                transformResponse: $http.defaults.transformResponse.concat([unserializeArray])
            }
        });

        function serialize(resource) {
            return angular.extend({}, {
                _id: resource._id,
                type: resource.type,
                user: resource.type === 'user' ? resource.user : null,
                email: resource.type === 'artificial' ? resource.email : null,
                name: resource.name,
                tenant: resource.tenant,
                constraints: [{
                        type: 'day',
                        value_since: parseInt(resource.sinceDay),
                        value_until: parseInt(resource.untilDay)
                    },
                    {
                        type: 'time',
                        value_since: parseInt(resource.sinceTime),
                        value_until: parseInt(resource.untilTime)
                    }]
            });
        }
        function unserialize(resource) {
            return angular.extend(new Resource(), resource, {
                sinceDay: resource.constraints ? parseInt(resource.constraints[0].value_since) : 1,
                untilDay: resource.constraints ? parseInt(resource.constraints[0].value_until) : 7,
                sinceTime: resource.constraints ? parseInt(resource.constraints[1].value_since) : 0,
                untilTime: resource.constraints ? parseInt(resource.constraints[1].value_until) : 24 * settings.slotsPerHour
            });
        }
        function unserializeArray(resourceArray) {
            if (resourceArray.resources) {
                resourceArray.resourcesLocal = [];
                resourceArray.resources.forEach(function (resource) {
                    resourceArray.resourcesLocal.push(unserialize(resource));
                });

                return resourceArray;
            }
        }

        Resource.serialize = serialize;
        Resource.unserialize = unserialize;

        return Resource;
    });
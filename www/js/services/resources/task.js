angular.module('Secretary')
        .factory('Task', function ($resource, $http, serverUrl, moment, dateTimeFormatEdit, dateTimeFormatDisplay) {
                var Task = $resource(serverUrl + "/tasks/:userId:taskId", {
                    taskId: "@_id"
                }, {
                    queryMine: {
                        method: "GET",
                        isArray: true,
                        params: {
                            userId: "@userId"
                        },
                        transformResponse: $http.defaults.transformResponse.concat([function (tasks) {
                                return tasks.map(unserialize);
                            }])
                    },
                    get: {
                        method: "GET",
                        url: serverUrl + "/task/:taskId",
                        transformResponse: $http.defaults.transformResponse.concat([unserialize])
                    },
                    save: {
                        method: "POST",
                        transformRequest: [serialize].concat($http.defaults.transformRequest)
                    },
                    remove: {
                        method: "DELETE"
                    }
                });

                function serialize(task) {
                    var new_task = angular.extend({}, task, {
                    });
                    return new_task;
                }
                
                function unserialize(task) {
                    var new_task = angular.extend(new Task(), task, {
                        dueDate: moment(task.dueDate).local().format(dateTimeFormatEdit),
                        createdOn: moment(task.createdOn).local().format(dateTimeFormatEdit),
                        updated: moment(task.updated).local().format(dateTimeFormatEdit),
                        dueDateDisplay: moment(task.dueDate).local().format(dateTimeFormatDisplay),
                        createdOnDisplay: moment(task.createdOn).local().format(dateTimeFormatDisplay),
                        updatedDisplay: moment(task.updated).local().format(dateTimeFormatDisplay)
                    });
                    return new_task;
                }
                
                Task.serialize = serialize;
                Task.unserialize = unserialize;

                return Task;
            });
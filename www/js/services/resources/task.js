angular.module('Schedulogy')
    .factory('Task', function ($resource, settings) {
        var Task = $resource(settings.serverUrl + "/task", {}, {
            query: {
                method: "GET",
                url: settings.serverUrl + "/task",
                params: {
                    btime: '@btime'
                }
            },
            get: {
                method: "GET",
                url: settings.serverUrl + "/task/:taskId",
                params: {
                    btime: '@btime'
                }
            },
            save: {
                method: "POST",
                params: {
                    btime: '@btime'
                }
            },
            checkConstraints: {
                method: "POST",
                url: settings.serverUrl + "/task/checkConstraints",
                params: {
                    btime: '@btime'
                }
            },
            remove: {
                method: "DELETE",
                url: settings.serverUrl + "/task/:taskId",
                params: {
                    taskId: "@taskId",
                    btime: '@btime'
                }
            },
            deleteAll: {
                method: "DELETE",
                url: settings.serverUrl + "/task"
            }
        });

        Task.toServer = function (task) {
            // All types must have ids.
            var toReturn = angular.extend(new Task, {
                _id: task._id,
                type: task.type
            });
            switch (task.type) {
                case 'task':
                    // Some cleanup.
                    // TODO - find out why these (null values in the arrays) are happening.
                    task.blocks = task.blocks.filter(function (e) {
                        return e ? true : false;
                    });
                    task.needs = task.needs.filter(function (e) {
                        return e ? true : false;
                    });

                    toReturn = angular.extend(toReturn, {
                        title: task.title,
                        start: (task.allDay ? task.start.clone().local().startOf('day').utc() : task.start.clone().utc()).unix(),
                        dur: task.dur,
                        allDay: task.allDay,
                        admissibleResources: task.admissibleResources,
                        constraint: {
                            start: task.constraint.start ? task.constraint.start.toISOString() : null,
                            end: task.constraint.end ? task.constraint.end.toISOString() : null
                        },
                        desc: task.desc,
                        due: task.due.unix(),
                        needs: event.needs || [],
                        blocks: event.blocks || []
                    });
                    break;
                case 'event':
                    toReturn = angular.extend(toReturn, {
                        title: task.title,
                        start: (task.allDay ? task.start.clone().local().startOf('day') : task.start.clone()).unix(),
                        end: task.end.clone().unix(),
                        dur: task.dur,
                        allDay: task.allDay,
                        resource: task.resource,
                        iCalUid: task.iCalUid,
                        constraint: {
                            end: task.constraint.end ? task.constraint.end.toISOString() : null
                        },
                        desc: task.desc,
                        blocks: task.blocks || []
                    });
                    break;
                case 'reminder':
                    toReturn = angular.extend(toReturn, {
                        title: task.title,
                        desc: task.desc,
                        resource: task.resource,
                        start: task.done ? task.start.unix() : null,
                        done: task.done
                    });
                    break;
            }

            return toReturn;
        };

        return Task;
    });
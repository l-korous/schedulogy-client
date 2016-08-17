angular.module('Schedulogy')
    .factory('Task', function ($resource, settings) {
            var Task = $resource(settings.serverUrl + "/task", {}, {
                query: {
                    method: "GET",
                    url: settings.serverUrl + "/task",
                    params: {
                        //userId: "@userId",
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

            Task.fromEvent = function (event) {
                var task = angular.extend(new Task, {
                    _id: event._id,
                    title: event.title,
                    start: (event.type === 'fixedAllDay' ? event.start.clone().utc().startOf('day') : event.start.clone().utc()).unix(),
                    dur: event.dur,
                    type: event.type,
                    resource: event.resource,
                    admissibleResources: event.admissibleResources,
                    iCalUid: event.iCalUid,
                    constraint: {
                        start: event.constraint.start ? event.constraint.start.toISOString() : null,
                        end: event.constraint.end ? event.constraint.end.toISOString() : null
                    },
                    desc: event.desc,
                    due: event.due ? event.due.unix() : null,
                    needs: event.type === 'floating' ? event.needs : [],
                    blocks: event.blocks || []
                });

                return task;
            };

            return Task;
        });
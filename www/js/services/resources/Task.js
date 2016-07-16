angular.module('Schedulogy')
    .factory('Task', ['$resource', '$http', 'settings', 'moment', 'DateUtils', function ($resource, $http, settings, moment, DateUtils) {
            var Task = $resource(settings.serverUrl + "/task", {}, {
                query: {
                    method: "GET",
                    url: settings.serverUrl + "/task",
                    params: {
                        //userId: "@userId",
                        btime: DateUtils.getBTime().unix()
                    }
                },
                get: {
                    method: "GET",
                    url: settings.serverUrl + "/task/:taskId",
                    params: {
                        btime: DateUtils.getBTime().unix()
                    }
                },
                save: {
                    method: "POST",
                    params: {
                        btime: DateUtils.getBTime().unix()
                    }
                },
                remove: {
                    method: "DELETE",
                    url: settings.serverUrl + "/task/:taskId",
                    params: {
                        taskId: "@taskId",
                        btime: DateUtils.getBTime().unix()
                    }
                }
            });

            Task.fromEvent = function (event) {
                var task = angular.extend(new Task, {
                    _id: event._id,
                    title: event.title,
                    start: (event.type === 'fixedAllDay' ? event.start.clone().utc().startOf('day') : event.start.clone().utc()).unix(),
                    dur: event.dur,
                    type: event.type,
                    constraint: {
                        start: event.constraint.start ? event.constraint.start.toISOString() : null,
                        end: event.constraint.end ? event.constraint.end.toISOString() : null
                    },
                    desc: event.desc,
                    due: event.due ? event.due.unix() : null,
                    deps: event.deps
                });
                
                return task;
            };

            return Task;
        }]);
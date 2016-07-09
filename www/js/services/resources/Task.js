angular.module('Scheduler')
    .factory('Task', ['$resource', '$http', 'settings', 'moment', 'DateUtils', function ($resource, $http, settings, moment, DateUtils) {
            var Task = $resource(settings.serverUrl + "/task", {}, {
                query: {
                    method: "GET",
                    url: settings.serverUrl + "/task",
                    params: {
                        //userId: "@userId",
                        btime: DateUtils.getBTime().toISOString()
                    }
                },
                get: {
                    method: "GET",
                    url: settings.serverUrl + "/task/:taskId",
                    params: {
                        btime: DateUtils.getBTime().toISOString()
                    }
                },
                save: {
                    method: "POST",
                    params: {
                        btime: DateUtils.getBTime().toISOString()
                    }
                },
                remove: {
                    method: "DELETE",
                    url: settings.serverUrl + "/task/:taskId",
                    params: {
                        taskId: "@taskId",
                        btime: DateUtils.getBTime().toISOString()
                    }
                }
            });

            Task.fromEvent = function (event) {
                var task = angular.extend(new Task, {
                    _id: event._id,
                    title: event.title,
                    start: event.type === 'fixedAllDay' ? event.start.clone().utc().startOf('day') : event.start.clone().utc(),
                    dur: event.dur,
                    type: event.type,
                    due: event.due,
                    desc: event.desc,
                    deps: event.deps
                });
                return task;
            };

            return Task;
        }]);
angular.module('Scheduler')
    .factory('Task', ['$resource', '$http', 'settings', 'moment', function ($resource, $http, settings, moment) {
            var Task = $resource(settings.serverUrl + "/task", {}, {
                query: {
                    method: "GET",
                    url: settings.serverUrl + "/task",
                    //params: {
                    //    userId: "@userId"
                    //},
                },
                get: {
                    method: "GET",
                    url: settings.serverUrl + "/task/:taskId"
                },
                save: {
                    method: "POST"
                },
                remove: {
                    method: "DELETE",
                    url: settings.serverUrl + "/task/:taskId",
                    params: {
                        taskId: "@taskId"
                    }
                }
            });

            Task.fromEvent = function (event) {
                var task = angular.extend(new Task, {
                    _id: event._id,
                    title: event.title,
                    start: event.start,
                    dur: event.dur,
                    type: event.type,
                    due: event.due,
                    desc: event.desc,
                    deps: event.deps
                });
                return task;
            };

            Task.toEvent = function (task) {
                var start = moment(task.start);
                var end = start.clone().add(task.type === 'fixedAllDay' ? task.dur - 1 : task.dur, task.type === 'fixedAllDay' ? 'days' : 'hours');
                var event = angular.extend(task, {
                    id: task._id,
                    start: start,
                    startDateText: start.format(settings.dateFormat),
                    startTimeText: start.format(settings.timeFormat),
                    end: end,
                    endDateText: end.format(settings.dateFormat),
                    endTimeText: end.format(settings.timeFormat),
                    stick: true,
                    allDay: (task.type === 'fixedAllDay')
                }, task);

                if (task.type === 'floating') {
                    event.due = moment(task.due);
                    event.dueDateText = event.due.format(settings.dateFormat);
                    event.dueTimeText = event.due.format(settings.timeFormat);
                }

                return event;
            };

            return Task;
        }]);
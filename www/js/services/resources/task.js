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
                    method: "DELETE"
                }
            });

            Task.fromEvent = function (event) {
                var task = new Task;
                task._id = event._id;
                // DELETE
                task.name = event.title;
                task.title = event.title;
                task.start = event.start;
                // DELETE
                task.starts = event.start;
                task.desc = event.desc;
                task.duration = event.duration;
                task.due = event.due;
                task.deps = event.deps;
                task.type = event.type;

                return task;
            };

            Task.toEvent = function (task) {
                // DELETE
                var start = moment(task.starts);
                var end = start.clone().add(task.duration, 'hours');
                var event = angular.extend({
                    id: task._id,
                    title: task.name,
                    // DELETE
                    start: start,
                    // PRYC S
                    startDateText: start.format(settings.dateFormat),
                    // PRYC S
                    startTimeText: start.format(settings.timeFormat),
                    // DELETE
                    end: end,
                    // PRYC S
                    endDateText: end.format(settings.dateFormat),
                    // PRYC S
                    endTimeText: end.format(settings.timeFormat),
                    stick: true
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
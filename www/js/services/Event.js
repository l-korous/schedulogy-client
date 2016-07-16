angular.module('Schedulogy')
    .factory('Event', function (moment, settings) {
        return {
            // This function assumes that the _id (and id) will not change.
            updateEvent: function (from, to) {
                from.title = to.title;
                from.start = to.start;
                from.startDateText = to.startDateText;
                from.startTimeText = to.startTimeText;
                from.end = to.end;
                from.endDateText = to.endDateText;
                from.endTimeText = to.endTimeText;
                from.dur = to.dur;
                from.dueDateText = to.dueDateText;
                from.dueTimeText = to.dueTimeText;
                from.stick = to.stick;
                from.type = to.type;
                from.allDay = to.allDay;
                from.due = to.due;
                from.due = to.due;
                from.due = to.due;
                from.due = to.due;
                from.deps = to.deps;
                from.depsForShow = to.depsForShow;
                from.desc = to.desc;
            },
            toEvent: function (task) {
                var start = moment.unix(task.start).local();
                var end = start.clone().add(task.dur, task.type === 'fixedAllDay' ? 'days' : 'hours');
                var custom_end = start.clone();
                var event = angular.extend(task, {
                    id: task._id,
                    start: (task.type === 'fixedAllDay' ? start.startOf('day') : start),
                    startDateText: start.format(settings.dateFormat),
                    startTimeText: start.format(settings.timeFormat),
                    end: (task.type === 'fixedAllDay' ? end.startOf('day') : end),
                    endDateText: (task.type === 'fixedAllDay' ? custom_end : end).format(settings.dateFormat),
                    endTimeText: (task.type === 'fixedAllDay' ? custom_end : end).format(settings.timeFormat),
                    stick: true,
                    allDay: (task.type === 'fixedAllDay'),
                    depsForShow: [],
                    constraint: {
                        start: moment(task.constraint.start).local(),
                        end: moment(task.constraint.end).local()
                    },
                    color: settings.eventColor[task.type]
                }, task);

                if (event.due) {
                    event.due = moment.unix(task.due);
                    event.dueDateText = event.due.format(settings.dateFormat);
                    event.dueTimeText = event.due.format(settings.timeFormat);
                }

                return event;
            }
        };
    });

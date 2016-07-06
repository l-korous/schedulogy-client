angular.module('Scheduler')
    .factory('Event', function (moment, settings, DateUtils) {
        var Event = {
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
                from.desc = to.desc;
            }
        };

        return Event;
    });

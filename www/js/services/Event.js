angular.module('Schedulogy')
    .service('Event', function (moment, settings) {
        // This function assumes that the _id (and id) will not change.
        this.updateEvent = function (from, to) {
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
            from.blocks = to.blocks;
            from.blocksForShow = to.blocksForShow;
            from.needs = to.needs;
            from.needsForShow = to.needsForShow;
            from.desc = to.desc;
        };
        this.processConstraint = function (event, constraint, btime) {
            var resConstraint = constraint || event.constraint;
            if (resConstraint.start) {
                var constraintStart = moment(resConstraint.start).local();
                event.constraint = angular.extend(event.constraint, {
                    start: constraintStart,
                    startDateText: constraintStart.format(settings.dateFormat),
                    startTimeText: constraintStart.format(settings.timeFormat),
                    startDateDueText: constraintStart.clone().add(event.dur, 'h').format(settings.dateFormat),
                    startTimeDueText: constraintStart.clone().add(event.dur, 'h').format(settings.timeFormat)
                });
            }
            else {
                event.constraint = angular.extend(event.constraint, {
                    start: btime.local(),
                    startDateText: null,
                    startTimeText: null,
                    startDateDueText: null,
                    startTimeDueText: null
                });
            }

            if (event.constraint.end) {
                var constraintEnd = moment(resConstraint.end).local();

                event.constraint = angular.extend(event.constraint, {
                    end: constraintEnd,
                    endDateText: constraintEnd.format(settings.dateFormat),
                    endTimeText: constraintEnd.format(settings.timeFormat)
                });
            }
            else {
                event.constraint = angular.extend(event.constraint, {
                    end: btime.clone().add(1, 'y').local(),
                    endDateText: null,
                    endTimeText: null
                });
            }
        };
        this.toEvent = function (task, btime) {
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
                blocksForShow: [],
                needsForShow: [],
                color: settings.eventColor[task.type],
                borderColor: settings.eventBorderColor
            }, task);

            if (event.due) {
                event.due = moment.unix(task.due);
                event.dueDateText = event.due.format(settings.dateFormat);
                event.dueTimeText = event.due.format(settings.timeFormat);
            }

            this.processConstraint(event, event.constraint, btime);

            return event;
        };
        this.earliestPossibleFinish = function (event) {
            if (event.type === 'floating')
                return event.constraint.start.clone().add(event.dur, 'h');
            else if (event.type === 'fixed' || event.type === 'fixedAllDay') {
                var unit = (event.type === 'fixed' ? 'h' : 'd');
                if (event.start.diff(event.constraint.start, 'h') >= 0)
                    return event.start.clone().add(event.dur, unit);
                else {
                    console.log('earliestPossibleFinish: Something weird, constraint start time is larger than current start time.');
                    return event.constraint.start.clone().add(event.dur, unit);
                }
            }
        };
        this.latestPossibleStart = function (event) {
            if (event.type === 'floating')
                return event.due.clone().add(-event.dur, 'h');
            else if (event.type === 'fixed' || event.type === 'fixedAllDay') {
                var unit = (event.type === 'fixed' ? 'h' : 'd');
                if (event.end.diff(event.constraint.end, 'h') <= 0)
                    return event.end.clone().add(-event.dur, unit);
                else {
                    console.log('latestPossibleStart: Something weird, constraint end time is smaller than current end time.');
                    return event.constraint.end.clone().add(-event.dur, unit);
                }
            }
        };
    });

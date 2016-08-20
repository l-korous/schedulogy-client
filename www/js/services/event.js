angular.module('Schedulogy')
    .service('Event', function (moment, settings, DateUtils) {
        this.changeType = function (event, toType) {
            if (toType === 'floating') {
                event.type = 'floating';
                event.allDay = false;
            }
            else if (toType === 'fixed') {
                event.type = 'fixed';
                event.allDay = false;
            }
            else if (toType === 'fixedAllDay') {
                event.type = 'fixedAllDay';
                event.allDay = true;
            }
        };

        this.processConstraint = function (event, constraint, btime) {
            var resConstraint = constraint || event.constraint;
            if (resConstraint.start) {
                var constraintStart = moment(resConstraint.start).local();
                event.constraint = angular.extend(event.constraint, {
                    start: constraintStart,
                    startDateText: constraintStart.format(settings.dateFormat),
                    startTimeText: constraintStart.format(settings.timeFormat),
                    startDateDueText: constraintStart.clone().add(event.dur * settings.minuteGranularity, 'm').format(settings.dateFormat),
                    startTimeDueText: constraintStart.clone().add(event.dur * settings.minuteGranularity, 'm').format(settings.timeFormat)
                });
            }
            else {
                event.constraint = angular.extend(event.constraint, {
                    // If the event is currently going on (i.e. btime > event.start), push the constraint start before btime
                    // => if the user wants to move the current task to later, he should move it to earlier than btime actually.
                    start: ((event.start.diff(btime.local(), 'm') < 0) ? event.start.clone() : btime.local()),
                    startDateText: null,
                    startTimeText: null,
                    startDateDueText: null,
                    startTimeDueText: null
                });
            }

            if (resConstraint.end) {
                var constraintEnd = moment(resConstraint.end).local();

                event.constraint = angular.extend(event.constraint, {
                    end: constraintEnd,
                    endDateText: constraintEnd.format(settings.dateFormat),
                    endTimeText: constraintEnd.format(settings.timeFormat)
                });
            }
            else {
                event.constraint = angular.extend(event.constraint, {
                    end: btime.clone().add(settings.weeks, 'w').local(),
                    endDateText: null,
                    endTimeText: null
                });
            }
            // This is the case when task can't be scheduled in such a duration and due date because of constraints.
            if ((event.dur * settings.minuteGranularity * (event.type === 'fixedAllDay' ? 1440 : 1)) > event.constraint.end.diff(event.constraint.start, 'm'))
                return false;
            else {
                if (event.type === 'floating') {
                    // Task is due earlier that it can be.
                    var minDue = event.constraint.start.clone().add(event.dur * settings.minuteGranularity, 'm');
                    if (event.due.diff(minDue, 'm') < 0) {
                        event.due = minDue;
                        event.dueDateText = event.due.format(settings.dateFormat);
                        event.dueTimeText = event.due.format(settings.timeFormat);
                    }
                    // Task is due later that it can be.
                    var maxDue = event.constraint.end;
                    if (event.due.diff(maxDue, 'm') > 0) {
                        event.due = maxDue;
                        event.dueDateText = event.due.format(settings.dateFormat);
                        event.dueTimeText = event.due.format(settings.timeFormat);
                    }
                }
                else {
                    // There is no constraint on start (fixed tasks do not have prerequisites).
                    // Task is due later that it can be.
                    var maxEnd = event.constraint.end;
                    if (event.end.diff(maxDue, 'm') > 0) {
                        event.end = maxEnd;
                        event.endDateText = (event.type === 'fixedAllDay' ? event.end.startOf('day') : event.end).format(settings.dateFormat);
                        event.endTimeText = (event.type === 'fixedAllDay' ? event.end.startOf('day') : event.end).format(settings.timeFormat);
                    }
                }
            }
            return event;
        };
        this.toEvent = function (task, btime) {
            var start = moment.unix(task.start).local();
            var toAddMinutes = (task.type === 'fixedAllDay' ? 1440 : settings.minuteGranularity) * task.dur;
            var end = start.clone().add(toAddMinutes, 'm');
            var event = angular.extend(task, {
                id: task._id,
                start: (task.type === 'fixedAllDay' ? start.startOf('day') : start),
                startDateText: start.format(settings.dateFormat),
                startTimeText: task.type === 'fixedAllDay' ? null : start.format(settings.timeFormat),
                end: (task.type === 'fixedAllDay' ? end.startOf('day') : end),
                endDateText: (task.type === 'fixedAllDay' ? end.startOf('day') : end).format(settings.dateFormat),
                endTimeText: (task.type === 'fixedAllDay' ? end.startOf('day') : end).format(settings.timeFormat),
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

            DateUtils.saveDurText(event);

            return this.processConstraint(event, event.constraint, btime);
        };
        this.earliestPossibleFinish = function (event) {
            var toAddMinutes = (event.type === 'fixedAllDay' ? 1440 : settings.minuteGranularity) * event.dur;

            if (event.type === 'floating')
                return event.constraint.start.clone().add(toAddMinutes, 'm');
            else if (event.type === 'fixed' || event.type === 'fixedAllDay') {
                if (event.start.diff(event.constraint.start, 'm') >= 0)
                    return event.start.clone().add(toAddMinutes, 'm');
                else {
                    console.log('earliestPossibleFinish: Something weird, constraint start time is larger than current start time.');
                    return event.constraint.start.clone().add(toAddMinutes, 'm');
                }
            }
        };
        this.latestPossibleStart = function (event) {
            var toSubtractMinutes = (event.type === 'fixedAllDay' ? 1440 : settings.minuteGranularity) * event.dur;

            if (event.type === 'floating')
                return event.due.clone().add(-toSubtractMinutes, 'm');
            else if (event.type === 'fixed' || event.type === 'fixedAllDay') {
                if (event.end.diff(event.constraint.end, 'm') <= 0)
                    return event.end.clone().add(-toSubtractMinutes, 'm');
                else {
                    console.log('latestPossibleStart: Something weird, constraint end time is smaller than current end time.');
                    return event.constraint.end.clone().add(-toSubtractMinutes, 'm');
                }
            }
        };
    });

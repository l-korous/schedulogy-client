angular.module('Schedulogy')
    .service('Event', function (moment, settings, DateUtils) {
        this.btime = null;

        this.setBTime = function (btime) {
            this.btime = btime;
        };

        this.setStart = function (event, start) {
            event.start = start;
            event.startDateText = event.start.format(settings.dateFormat);
            event.startTimeText = event.start.format(settings.timeFormat);
        };

        this.setDue = function (event, due) {
            event.due = due;
            event.dueDateText = event.due.format(settings.dateFormat);
            event.dueTimeText = event.due.format(settings.timeFormat);
        };

        this.setEnd = function (event, end) {
            event.end = end;
            // For fixedAllDay, we deduct one day from what we present as the 'end'.
            if (event.type === 'fixedAllDay') {
                var custom_end = event.end.clone().add(-1, 'days');
                event.endDateText = custom_end.format(settings.dateFormat);
                event.endTimeText = custom_end.format(settings.timeFormat);
            }
            else {
                event.endDateText = event.end.format(settings.dateFormat);
                event.endTimeText = event.end.format(settings.timeFormat);
            }
        };

        this.processConstraint = function (event, constraint) {
            var resConstraint = constraint || event.constraint;

            // Event.constraint will always be there EXCEPT for the case when we are importing an iCal and there is an event which started before the input and finishes after that.
            // But no problem, what we do is that we treat it as having no constraint - it is a fixed task after all.
            if (event.type === 'floating' && resConstraint && resConstraint.start) {
                var constraintStart = moment(resConstraint.start).local();
                var constraintStartDue = constraintStart.clone().add(event.dur * settings.minuteGranularity, 'm');
                event.constraint = angular.extend(event.constraint, {
                    start: constraintStart,
                    startDue: constraintStartDue,
                    startDateText: constraintStart.format(settings.dateFormat),
                    startTimeText: constraintStart.format(settings.timeFormat),
                    startDateDueText: constraintStartDue.format(settings.dateFormat),
                    startTimeDueText: constraintStartDue.format(settings.timeFormat)
                });
            }
            else {
                event.constraint = {
                    // If the event is currently going on (i.e. this.btime > event.start), push the constraint start before this.btime
                    // => if the user wants to move the current task to later, he should move it to earlier than this.btime actually.
                    start: event.type === 'floating' ? ((event.start.diff(this.btime.local(), 'm') < 0) ? event.start.clone() : this.btime.local()) : moment({y:2010}),
                    startDateText: null,
                    startTimeText: null,
                    startDateDueText: null,
                    startTimeDueText: null
                };
            }

            if (resConstraint && resConstraint.end) {
                var constraintEnd = moment(resConstraint.end).local();

                event.constraint = angular.extend(event.constraint, {
                    end: constraintEnd,
                    endDateText: constraintEnd.format(settings.dateFormat),
                    endTimeText: constraintEnd.format(settings.timeFormat)
                });
            }
            else {
                event.constraint = angular.extend(event.constraint, {
                    end: moment({y:2030}),
                    endDateText: null,
                    endTimeText: null
                });
            }
            // This is the case when task can't be scheduled in such a duration and due date because of constraints.
            if ((event.dur * (event.type === 'fixedAllDay' ? 1440 : settings.minuteGranularity)) > event.constraint.end.diff(event.constraint.start, 'm')) {
                console.log('Problem with duration:');
                console.log(event);
                return false;
            }
            else {
                if (event.type === 'floating') {
                    // Task is due earlier that it can be.
                    var minDue = event.constraint.startDue;
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
                    // Task ends later that it can.
                    var maxEnd = event.constraint.end;
                    if (event.end.diff(maxEnd, 'm') > 0) {
                        event.end = maxEnd;
                        event.endDateText = (event.type === 'fixedAllDay' ? event.end.startOf('day') : event.end).format(settings.dateFormat);
                        event.endTimeText = (event.type === 'fixedAllDay' ? event.end.startOf('day') : event.end).format(settings.timeFormat);
                    }
                }
            }
            return event;
        };

        this.toEvent = function (task) {
            var start = moment.unix(task.start).local();
            var toAddMinutes = (task.type === 'fixedAllDay' ? 1440 : settings.minuteGranularity) * task.dur;
            var end = start.clone().add(toAddMinutes, 'm');
            var custom_end = end.clone().add(-1, 'days');
            var event = angular.extend(task, {
                id: task._id,
                start: (task.type === 'fixedAllDay' ? start.startOf('day') : start),
                startDateText: start.format(settings.dateFormat),
                startTimeText: task.type === 'fixedAllDay' ? null : start.format(settings.timeFormat),
                end: (task.type === 'fixedAllDay' ? end.startOf('day') : end),
                endDateText: (task.type === 'fixedAllDay' ? custom_end : end).format(settings.dateFormat),
                endTimeText: (task.type === 'fixedAllDay' ? custom_end : end).format(settings.timeFormat),
                stick: true,
                allDay: (task.type === 'fixedAllDay'),
                blocksForShow: [],
                needsForShow: [],
                color: settings.eventColor[task.type],
                borderColor: settings.eventBorderColor,
                shortInfo: task.title + ' - ' + start.format(settings.dateFormat) + (task.type === 'fixedAllDay' ? '' : (' ' + start.format(settings.timeFormat)))
            }, task);

            if (event.due) {
                event.due = moment.unix(task.due);
                event.dueDateText = event.due.format(settings.dateFormat);
                event.dueTimeText = event.due.format(settings.timeFormat);
            }

            DateUtils.saveDurText(event);

            return this.processConstraint(event, event.constraint, this.btime);
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

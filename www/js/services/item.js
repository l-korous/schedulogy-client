angular.module('Schedulogy')
    .service('Item', function (moment, constants, DateUtils) {
        this.btime = null;
        this.setBTime = function (btime) {
            this.btime = btime;
        };
        this.setStart = function (item, start) {
            if (start)
                item.start = start;

            item.startDateText = item.start.format(constants.dateFormatLong);
            if (item.allDay)
                item.startTimeText = null;
            else
                item.startTimeText = item.start.format(constants.timeFormat);

            if (item.start.local().day() === moment(new Date()).local().day())
                item.startDateText += ' (today)';
            else {
                var hourDifference = item.start.diff(new Date(), "hour");
                if (hourDifference > -24 && hourDifference < 0)
                    item.startDateText += ' (yesterday)';
                if (hourDifference < 24 && hourDifference > 0)
                    item.startDateText += ' (tomorrow)';
            }
        };
        this.setRepetitionEnd = function (item) {
            item.repetition.endDateText = item.repetition.end.format(constants.dateFormatLong);
        };
        this.setDue = function (item, due) {
            if (due)
                item.due = due;

            item.dueDateText = item.due.format(constants.dateFormatLong);

            if (item.allDay)
                item.dueTimeText = null;
            else
                item.dueTimeText = item.due.format(constants.timeFormat);
        };
        this.setDur = function (item, dur) {
            if (dur)
                item.dur = dur;

            if (item.allDay)
                item.durText = item.dur + ' days';
            else
                item.durText = DateUtils.getTimeFromSlotCount(item.dur) + ' hrs';
        };
        this.setEnd = function (item, end) {
            if (end)
                item.end = end;

            // For fixedAllDay, we deduct one day from what we present as the 'end'.
            if (item.allDay) {
                var custom_end = item.end.clone().add(-1, 'days');
                item.endDateText = custom_end.format(constants.dateFormat);
                item.endTimeText = null;
            } else {
                item.endDateText = item.end.format(constants.dateFormat);
                item.endTimeText = item.end.format(constants.timeFormat);
            }
        };
        this.processConstraint = function (item, constraint) {
            var resConstraint = constraint || item.constraint;
            // Item.constraint will always be there EXCEPT for the case when we are importing an iCal and there is an item which started before the input and finishes after that.
            // But no problem, what we do is that we treat it as having no constraint - it is a fixed task after all.
            if (item.type === 'task' && resConstraint && resConstraint.start) {
                var constraintStart = moment(resConstraint.start).local();
                var constraintStartDue = constraintStart.clone().add(item.dur * constants.minuteGranularity, 'm');
                item.constraint = angular.extend(item.constraint, {
                    start: constraintStart,
                    startDue: constraintStartDue,
                    startDateText: constraintStart.format(constants.dateFormatLong),
                    startTimeText: constraintStart.format(constants.timeFormat),
                    startDateDueText: constraintStartDue.format(constants.dateFormatLong),
                    startTimeDueText: constraintStartDue.format(constants.timeFormat)
                });
            } else if (item.type === 'event') {
                item.constraint = {
                    // If the item is currently going on (i.e. this.btime > item.start), push the constraint start before this.btime
                    // => if the user wants to move the current task to later, he should move it to earlier than this.btime actually.
                    start: item.type === 'task' ? ((item.start.diff(this.btime.local(), 'm') < 0) ? item.start.clone() : this.btime.local()) : moment({y: 2010}),
                    startDue: null,
                    startDateText: null,
                    startTimeText: null,
                    startDateDueText: null,
                    startTimeDueText: null
                };
            }

            if (resConstraint && resConstraint.end) {
                var constraintEnd = moment(resConstraint.end).local();
                item.constraint = angular.extend(item.constraint, {
                    end: constraintEnd,
                    endDateText: constraintEnd.format(constants.dateFormat),
                    endTimeText: constraintEnd.format(constants.timeFormat)
                });
            } else if (item.constraint) {
                item.constraint = angular.extend(item.constraint, {
                    end: moment({y: 2030}),
                    endDateText: null,
                    endTimeText: null
                });
            }
            // This is the case when task can't be scheduled in such a duration and due date because of constraints.
            if (item.constraint && (item.dur * (item.allDay ? 1440 : constants.minuteGranularity)) > item.constraint.end.diff(item.constraint.start, 'm')) {
                console.log('Problem with duration:');
                console.log(item);
                return false;
            } else {
                if (item.type === 'task') {
                    // Task is due earlier that it can be.
                    var minDue = item.constraint.startDue;
                    if (item.due.diff(minDue, 'm') < 0) {
                        item.due = minDue;
                        item.dueDateText = item.due.format(constants.dateFormatLong);
                        item.dueTimeText = item.due.format(constants.timeFormat);
                    }
                    // Task is due later that it can be.
                    var maxDue = item.constraint.end;
                    if (item.due.diff(maxDue, 'm') > 0) {
                        item.due = maxDue;
                        item.dueDateText = item.due.format(constants.dateFormatLong);
                        item.dueTimeText = item.due.format(constants.timeFormat);
                    }
                } else if (item.type === 'event') {
                    // There is no constraint on start (fixed tasks do not have prerequisites).
                    // Task ends later that it can.
                    var maxEnd = item.constraint.end;
                    if (item.end.diff(maxEnd, 'm') > 0) {
                        item.end = maxEnd;
                        item.endDateText = (item.allDay ? item.end.startOf('day') : item.end).format(constants.dateFormat);
                        item.endTimeText = (item.allDay ? item.end.startOf('day') : item.end).format(constants.timeFormat);
                    }
                }
            }
            return item;
        };
        this.fromServer = function (task) {
            var item = {
                id: task._id,
                _id: task._id,
                title: task.title,
                desc: task.desc,
                type: task.type,
                resource: task.resource,
                resourceName: task.resourceName,
                // Some technicality
                stick: true,
                color: constants.itemColor(task.type, task.allDay),
                borderColor: constants.itemBorderColor
            };
            switch (task.type) {
                case 'task':
                    var start = moment.unix(task.start).local();
                    start = (task.allDay ? start.startOf('day') : start);
                    var toAddMinutes = (task.allDay ? 1440 : constants.minuteGranularity) * task.dur;
                    var end = start.clone().add(toAddMinutes, 'm');
                    var due = moment.unix(task.due);

                    item = angular.extend(item, {
                        allDay: (task.allDay),
                        blocks: task.blocks,
                        needs: task.needs,
                        constraint: task.constraint,
                        notifications: task.notifications ? task.notifications : [],
                        admissibleResources: task.admissibleResources,
                        blocksForShow: [],
                        needsForShow: []
                    });

                    if (task.allDay) {
                        item = angular.extend(item, {
                            shortInfo: '(due ' + due.format(constants.dateFormat) + ')'
                        });
                    } else {
                        item = angular.extend(item, {
                            shortInfo: '(due ' + due.format(constants.dateFormat) + ', ' + due.format(constants.timeFormat) + ')'
                        });
                    }

                    this.setStart(item, start);
                    this.setDue(item, due);
                    this.setEnd(item, end);
                    this.setDur(item, task.dur);
                    break;
                case 'event':
                    var start = moment.unix(task.start).local();
                    start = (task.allDay ? start.startOf('day') : start);
                    var toAddMinutes = (task.allDay ? 1440 : constants.minuteGranularity) * task.dur;
                    var end = start.clone().add(toAddMinutes, 'm');

                    var item = angular.extend(item, {
                        allDay: (task.allDay),
                        blocks: task.blocks,
                        repetition: task.repetition,
                        notifications: task.notifications ? task.notifications : [],
                        constraint: task.constraint,
                        blocksForShow: []
                    });

                    this.setStart(item, start);
                    this.setEnd(item, end);
                    this.setDur(item, task.dur);

                    if (task.allDay) {
                        if (item.end.diff(item.start, 'd') === 1)
                            item = angular.extend(item, {
                                shortInfo: '(' + start.format(constants.dateFormat) + ')'
                            });
                        else
                            item = angular.extend(item, {
                                shortInfo: '(' + start.format(constants.dateFormat) + ' - ' + end.format(constants.dateFormat) + ')'
                            });
                    } else {
                        if (item.end.format('dd') === item.start.format('dd'))
                            item = angular.extend(item, {
                                shortInfo: '(' + start.format(constants.dateFormat) + ', ' + start.format(constants.timeFormat) + ' - ' + end.format(constants.timeFormat) + ')'
                            });
                        else
                            item = angular.extend(item, {
                                shortInfo: '(' + start.format(constants.dateFormat) + ', ' + start.format(constants.timeFormat) + ' - ' + end.format(constants.dateFormat) + ', ' + end.format(constants.timeFormat) + ')'
                            });
                    }

                    if (item.repetition) {
                        item.repetition.end = moment.unix(task.repetition.end).local();
                        this.setRepetitionEnd(item);
                    }
                    break;
                case 'reminder':
                    var item = angular.extend(item, {
                        allDay: true,
                        editable: false,
                        done: task.done,
                        repetition: task.repetition,
                        className: task.done ? 'doneReminder' : '',
                        shortInfo: (task.done ? ' (done)' : '(not done)')
                    });
                    if (task.done) {
                        item.color = '#ddd';
                        item.textColor = constants.itemColor('reminder', false);
                    }

                    var start = task.done ? moment.unix(task.start).local() : moment.unix(Math.max(this.btime.unix(), task.start)).local();
                    this.setStart(item, start);
                    if (item.repetition) {
                        item.repetition.end = moment.unix(task.repetition.end).local();
                        this.setRepetitionEnd(item);
                    }
                    break;
            }
            angular.extend(item, {
                info: item.title + ' ' + item.shortInfo
            });
            return this.processConstraint(item, item.constraint, this.btime);
        };
        this.earliestPossibleFinish = function (item) {
            var toAddMinutes = (item.allDay ? 1440 : constants.minuteGranularity) * item.dur;
            if (item.type === 'task')
                return item.constraint.start.clone().add(toAddMinutes, 'm');
            else if (item.type === 'event') {
                if (item.start.diff(item.constraint.start, 'm') >= 0)
                    return item.start.clone().add(toAddMinutes, 'm');
                else {
                    console.log('earliestPossibleFinish: Something weird, constraint start time is larger than current start time.');
                    return item.constraint.start.clone().add(toAddMinutes, 'm');
                }
            }
        };
        this.latestPossibleStart = function (item) {
            var toSubtractMinutes = (item.allDay ? 1440 : constants.minuteGranularity) * item.dur;
            if (item.type === 'task')
                return item.due.clone().add(-toSubtractMinutes, 'm');
            else if (item.type === 'event') {
                if (item.end.diff(item.constraint.end, 'm') <= 0)
                    return item.end.clone().add(-toSubtractMinutes, 'm');
                else {
                    console.log('latestPossibleStart: Something weird, constraint end time is smaller than current end time.');
                    return item.constraint.end.clone().add(-toSubtractMinutes, 'm');
                }
            }
        };
    });

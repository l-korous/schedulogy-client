angular.module('Schedulogy')
    .service('MyEvents', function (moment, settings, Event, $ionicLoading, Task, ModalService, DateUtils, $rootScope, $timeout, $q) {
        var _this = this;
        _this.events = [];
        _this.dirtyEvents = [];

        _this.refresh = function () {
            Task.query({btime: _this.getBTime().unix()}, function (data) {
                _this.importFromTasks(data.tasks, data.dirtyTasks);
                $rootScope.$broadcast('MyEventsLoaded');
            }, function (err) {
                console.log('Task.query - error');
                if (err.data && err.data.tasks && err.data.dirtyTasks) {
                    _this.importFromTasks(err.data.tasks, err.data.dirtyTasks);
                    $rootScope.$broadcast('MyEventsLoaded');
                }
            });
        };

        _this.importFromTasks = function (tasks, dirtyTasks) {
            var processArray = function (taskArray, eventArray) {
                eventArray.splice(0, eventArray.length);

                // Very important - we need to set BTime for accurate calculation of constraints of all created Events.
                Event.setBTime(_this.getBTime());

                taskArray.forEach(function (task) {
                    eventArray.push(Event.toEvent(task));
                });

                if (_this.currentEvent && _this.currentEvent._id) {
                    var eventToSet = eventArray.find(function (event) {
                        return event._id === _this.currentEvent._id;
                    });
                    if (eventToSet)
                        _this.currentEvent = eventToSet;
                }
            };
            processArray(tasks, _this.events);
            processArray(dirtyTasks, _this.dirtyEvents);

            _this.events.forEach(function (event) {
                _this.fillBlocksAndNeedsForShow(event);
            });


            _this.dirtyEvents.forEach(function (event) {
                _this.fillBlocksAndNeedsForShow(event);
            });

            $('#theOnlyCalendar').fullCalendar('render');
        };

        _this.emptyCurrentEvent = function () {
            var btime = _this.getBTime();
            var btimePlusDuration = btime.clone().add(settings.defaultTaskDuration / settings.minuteGranularity, 'm');

            _this.currentEvent = {
                new : true,
                stick: true,
                type: settings.defaultTaskType,
                dur: settings.defaultTaskDuration,
                resource: $rootScope.myResourceId,
                admissibleResources: [$rootScope.myResourceId],
                start: btime,
                startDateText: btime.format(settings.dateFormat),
                startTimeText: btime.format(settings.timeFormat),
                end: btimePlusDuration,
                endDateText: btimePlusDuration.format(settings.dateFormat),
                endTimeText: btimePlusDuration.format(settings.timeFormat),
                due: btimePlusDuration,
                dueDateText: btimePlusDuration.format(settings.dateFormat),
                dueTimeText: btimePlusDuration.format(settings.timeFormat),
                blocks: [],
                blocksForShow: [],
                needs: [],
                needsForShow: [],
                constraint: {
                    start: null,
                    end: null
                }
            };

            DateUtils.saveDurText(this.currentEvent);
        };

        _this.fillBlocksAndNeedsForShow = function (event) {
            if (event.blocks) {
                event.blocksForShow.splice(0, event.blocksForShow.length);
                event.blocks.forEach(function (dep) {
                    var depObject = _this.events.find(function (event) {
                        if (event._id === dep)
                            return true;
                    });
                    if (depObject)
                        event.blocksForShow.push({_id: depObject._id, title: depObject.title, type: depObject.type, startDateText: depObject.startDateText, startTimeText: depObject.startTimeText, dueDateText: depObject.dueDateText, dueTimeText: depObject.dueTimeText});
                    else {
                        depObject = _this.dirtyEvents.find(function (event) {
                            if (event._id === dep)
                                return true;
                        });
                        event.blocksForShow.push({_id: depObject._id, title: depObject.title, type: depObject.type, startDateText: depObject.startDateText, startTimeText: depObject.startTimeText, dueDateText: depObject.dueDateText, dueTimeText: depObject.dueTimeText});
                        if (!depObject)
                            console.log('Error: dependent task not exists: ' + dep);
                    }
                });
            }

            if (event.needs) {
                event.needsForShow.splice(0, event.needsForShow.length);
                event.needs.forEach(function (dep) {
                    var depObject = _this.events.find(function (event) {
                        if (event._id === dep)
                            return true;
                    });
                    if (depObject)
                        event.needsForShow.push({_id: depObject._id, title: depObject.title, type: depObject.type, startDateText: depObject.startDateText, startTimeText: depObject.startTimeText, dueDateText: depObject.dueDateText, dueTimeText: depObject.dueTimeText});
                    else {
                        depObject = _this.dirtyEvents.find(function (event) {
                            if (event._id === dep)
                                return true;
                        });
                        event.needsForShow.push({_id: depObject._id, title: depObject.title, type: depObject.type, startDateText: depObject.startDateText, startTimeText: depObject.startTimeText, dueDateText: depObject.dueDateText, dueTimeText: depObject.dueTimeText});
                        if (!depObject)
                            console.log('Error: prerequisite task not exists: ' + dep);
                    }
                });
            }
        };

        _this.findEventById = function (passedEventId) {
            var eventToDelete = _this.events.find(function (event) {
                return event._id === passedEventId;
            });
            if (!eventToDelete)
                return _this.dirtyEvents.find(function (event) {
                    return event._id === passedEventId;
                });
            return eventToDelete;
        };

        _this.getCurrentEvents = function (now) {
            return $.grep(this.events, function (event) {
                return ((event.start <= now) && (event.end >= now));
            });
        };

        _this.deleteEvent = function (passedEvent, successCallback, errorCallback) {
            var eventToDelete = passedEvent || _this.currentEvent;

            _this.shouldShowLoading = true;
            $timeout(function () {
                if (_this.shouldShowLoading)
                    $ionicLoading.show({template: settings.loadingTemplate});
            }, 500);

            Task.fromEvent(eventToDelete).$remove({btime: _this.getBTime().unix(), taskId: eventToDelete._id}, function (data, headers) {
                _this.importFromTasks(data.tasks, data.dirtyTasks);
                _this.shouldShowLoading = false;
                $ionicLoading.hide();
                successCallback && successCallback();
            }, function (err) {
                _this.shouldShowLoading = false;
                $ionicLoading.hide();
                errorCallback && errorCallback();
                console.log(err);
            });
        };

        _this.deleteAll = function (successCallback, errorCallback) {
            _this.shouldShowLoading = true;
            $timeout(function () {
                if (_this.shouldShowLoading)
                    $ionicLoading.show({template: settings.loadingTemplate});
            }, 500);

            Task.deleteAll({}, function (data) {
                _this.importFromTasks(data.tasks, data.dirtyTasks);
                _this.shouldShowLoading = false;
                $ionicLoading.hide();
                successCallback && successCallback();
            }, function (err) {
                _this.shouldShowLoading = false;
                $ionicLoading.hide();
                errorCallback && errorCallback();
                // error callback
                console.log(err);
            });
        };

        _this.deleteEventById = function (passedEventId, successCallback, errorCallback) {
            _this.deleteEvent(this.findEventById(passedEventId), successCallback, errorCallback);
        };

        _this.handleChangeOfEventType = function (passedEvent) {
            var event = passedEvent || _this.currentEvent;

            if (event.dur > settings.maxEventDuration[event.type]) {
                event.dur = settings.maxEventDuration[event.type];
                _this.updateEndDateTimeWithDuration();
            }
            if (event.type === 'floating') {
                var dueMinutes = DateUtils.toMinutes(event.due);
                if (!dueMinutes)
                    dueMinutes = 1440;
                var startHourOffset = (dueMinutes - event.dur * settings.minuteGranularity) - (settings.startHour * 60);
                if (startHourOffset < 0)
                    event.due.add(-startHourOffset, 'm');
                var endHourOffset = (settings.endHour * 60) - (dueMinutes - event.dur * settings.minuteGranularity);
                if (endHourOffset < 0)
                    event.due.add(endHourOffset, 'm');

                event.dueDateText = event.due.format(settings.dateFormat);
                event.dueTimeText = event.due.format(settings.timeFormat);
            }
            event.color = settings.eventColor[event.type];
            _this.recalcConstraints(event);
        };

        _this.tasksInResponseSuccessHandler = function (data, successCallback) {
            _this.importFromTasks(data.tasks, data.dirtyTasks);
            successCallback && successCallback();
            _this.shouldShowLoading = false;
            $ionicLoading.hide();
        };

        _this.tasksInResponseErrorHandler = function (err, errorCallback) {
            if (err.data && err.data.tasks && err.data.dirtyTasks)
                _this.importFromTasks(err.data.tasks, err.data.dirtyTasks);

            ModalService.openModal('dirtyTasks');
            errorCallback && errorCallback();
            _this.shouldShowLoading = false;
            $ionicLoading.hide();
        };

        _this.processEventDrop = function (delta) {
            if (_this.currentEvent.type === 'fixed') {
                if (_this.currentEvent.allDay) {
                    Event.changeType(_this.currentEvent, 'fixedAllDay');
                    _this.currentEvent.start = _this.currentEvent.start.startOf('day');
                    _this.currentEvent.dur = 1;
                    _this.handleChangeOfEventType();
                }
                return true;
            }

            else if (_this.currentEvent.type === 'fixedAllDay') {
                if (!_this.currentEvent.allDay) {
                    Event.changeType(_this.currentEvent, 'fixed');
                    _this.currentEvent.start = _this.currentEvent.start.startOf('day');
                    _this.currentEvent.start.add(delta._milliseconds, 'ms');
                    _this.currentEvent.dur = 4;
                    _this.handleChangeOfEventType();
                }

                return true;
            }
        };

        _this.saveEvent = function (passedEvent, successCallback, errorCallback) {
            var eventToSave = passedEvent || _this.currentEvent;
            _this.shouldShowLoading = true;
            $timeout(function () {
                if (_this.shouldShowLoading)
                    $ionicLoading.show({template: settings.loadingTemplate});
            }, 500);
            Task.fromEvent(eventToSave).$save({btime: _this.getBTime().unix()}, function (data) {
                _this.tasksInResponseSuccessHandler(data, successCallback);
            }, function (err) {
                _this.tasksInResponseErrorHandler(err, errorCallback);
            });
        };

        _this.recalcConstraints = function (eventPassed) {
            console.log('recalculating Constraints');
            $ionicLoading.show({template: settings.loadingTemplate});

            var event = eventPassed ? eventPassed : _this.currentEvent;

            var defer = $q.defer();

            // Very important - we need to set BTime for accurate calculation of constraints of all created Events.
            Event.setBTime(_this.getBTime());

            Task.fromEvent(event).$checkConstraints({btime: _this.getBTime().unix()}, function (data) {
                $ionicLoading.hide();
                var constraintProcessResult = Event.processConstraint(event, data);
                if (constraintProcessResult) {
                    event = constraintProcessResult;
                    defer.resolve(true);
                }
                else
                    defer.resolve(false);
            }, function (err) {
                $ionicLoading.hide();
                defer.resolve(true);
                // error callback
                console.log(err);
            });
            return defer.promise;
        };

        _this.addDependency = function (eventPassed, dependencyId) {
            if (!dependencyId)
                return;

            var event = eventPassed ? eventPassed : _this.currentEvent;

            if (!_this.recalcConstraints(event))
                event.error = 'Impossible to schedule due to constraints';

            else {
                event.blocks.push(dependencyId);
                _this.fillBlocksAndNeedsForShow(event);
                dependencyId = null;
            }
        };

        _this.removeDependency = function (eventPassed, dependency) {
            if (!dependency)
                return;

            var event = eventPassed ? eventPassed : _this.currentEvent;

            if (!_this.recalcConstraints(event))
                event.error = 'Impossible to schedule due to constraints';

            else {
                for (var i = event.blocks.length - 1; i >= 0; i--) {
                    if (event.blocks[i] === dependency._id) {
                        event.blocks.splice(i, 1);
                        event.blocksForShow.splice(i, 1);
                    }
                }
            }
        };

        _this.addPrerequisite = function (eventPassed, prerequisiteId) {
            if (!prerequisiteId)
                return;

            var event = eventPassed ? eventPassed : _this.currentEvent;

            if (!_this.recalcConstraints(event))
                event.error = 'Impossible to schedule due to constraints';

            else {

                if (!this.currentEvent.needs)
                    s
                event.needs = [];

                event.needs.push(prerequisiteId);
                _this.fillBlocksAndNeedsForShow(event);
                prerequisiteId = null;
            }
        };

        _this.removePrerequisite = function (eventPassed, prerequisite) {
            if (!prerequisite)
                return;

            var event = eventPassed ? eventPassed : _this.currentEvent;

            if (!_this.recalcConstraints(event))
                event.error = 'Impossible to schedule due to constraints';

            else {
                for (var i = event.needs.length - 1; i >= 0; i--) {
                    if (event.needs[i] === prerequisite._id) {
                        event.needs.splice(i, 1);
                        event.needsForShow.splice(i, 1);
                    }
                }
            }
        };

        _this.updateEndDateTimeWithDuration = function (eventPassed) {
            var event = eventPassed ? eventPassed : _this.currentEvent;

            DateUtils.saveDurText(event);

            if (event.type === 'fixedAllDay' || event.type === 'fixed') {
                var toAddMinutes = (event.type === 'fixedAllDay' ? 1440 : settings.minuteGranularity) * event.dur;
                event.end = event.start.clone().add(toAddMinutes, 'minutes');

                // For all-day events, we are displaying the end day the same as the current one.
                if (event.type === 'fixedAllDay') {
                    var custom_end = event.start.clone();
                    event.endDateText = custom_end.format(settings.dateFormat);
                    event.endTimeText = custom_end.format(settings.timeFormat);
                }
                else if (event.type === 'fixed') {
                    event.endDateText = event.end.format(settings.dateFormat);
                    event.endTimeText = event.end.format(settings.timeFormat);
                }
            }
        };

        _this.getBTime = function () {
            if (settings.fixedBTime.on)
                return moment(settings.fixedBTime.date);

            var toReturn = moment(new Date());
            for (var i = 0; i < (60 / settings.minuteGranularity); i++) {
                var thisPart = (settings.minuteGranularity * (i + 1));
                if (toReturn.minute() < thisPart) {
                    toReturn.minute(thisPart);
                    break;
                }
            }

            // Move to next day.
            if ((toReturn.hours() * 60 + toReturn.minute()) > settings.endHour * 60) {
                toReturn.hours(settings.startHour);
                toReturn.minutes(0);
                toReturn.day(toReturn.day() + 1);
            }
            // Move to startHour (the same day).
            if (toReturn.hours() < settings.startHour) {
                toReturn.hours(settings.startHour);
                toReturn.minutes(0);
            }
            // Move Sat + Sun to Mon.
            /*
             if (toReturn.day() === 0 || toReturn.day() >= 6) {
             toReturn.hours(settings.startHour);
             toReturn.minutes(0);
             if (toReturn.day() === 0)
             toReturn.day(1);
             else
             toReturn.day(8);
             }
             */
            _this.getCurrentEvents(toReturn).forEach(function (currentEvent) {
                toReturn = (currentEvent.end > toReturn ? currentEvent.end : toReturn);
            });

            toReturn.second(0);
            return toReturn;
        };
    });

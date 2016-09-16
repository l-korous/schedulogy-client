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

            // Store the scroll, so that after the modal is hidden, we can re-establish the scroll.
            _this.scrollTop = $('.fc-scroller').scrollTop();

            $('#theOnlyCalendar').fullCalendar('render');

            // Scroll to where I was before.
            setTimeout(function () {
                $('.fc-scroller').scrollTop(_this.scrollTop);
            });
        };

        _this.setCurrentEvent = function (eventId) {
            _this.currentEvent = _this.events.find(function (event) {
                if (event._id === eventId)
                    return true;
            });
        };

        _this.newCurrentEvent = function (defaultObj) {
            var startTime = (defaultObj && defaultObj.start) ? defaultObj.start : _this.getBTime().clone().add(settings.defaultHourShiftFromNow, 'h');
            var endTime = (defaultObj && defaultObj.end) ? defaultObj.end : startTime.clone().add(settings.defaultTaskDuration / settings.minuteGranularity, 'm');
            var dur = (defaultObj && defaultObj.dur) ? defaultObj.dur : settings.defaultTaskDuration;
            var type = (defaultObj && defaultObj.type) ? defaultObj.type : settings.defaultTaskType;
            
            _this.currentEvent = {
                new : true,
                stick: true,
                type: type,
                dur: dur,
                resource: $rootScope.myResourceId,
                admissibleResources: [$rootScope.myResourceId],
                start: startTime,
                startDateText: startTime.format(settings.dateFormat),
                startTimeText: startTime.format(settings.timeFormat),
                end: endTime,
                endDateText: type === 'fixedAllDay' ? endTime.clone().add(-1,'days').format(settings.dateFormat) : endTime.format(settings.dateFormat),
                endTimeText: endTime.format(settings.timeFormat),
                due: endTime,
                dueDateText: endTime.format(settings.dateFormat),
                dueTimeText: endTime.format(settings.timeFormat),
                blocks: [],
                blocksForShow: [],
                needs: [],
                title: '',
                desc: '',
                needsForShow: [],
                constraint: {
                    start: null,
                    end: null
                }
            };

            DateUtils.saveDurText(_this.currentEvent);
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

        _this.imposeEventDurationBound = function (passedEvent) {
            var event = passedEvent || _this.currentEvent;

            if (event.dur > settings.maxEventDuration[event.type])
                event.dur = settings.maxEventDuration[event.type];
        };

        // (!!!) Might change duration and start.
        _this.processChangeOfEventType = function (passedEvent, prevType) {
            var event = passedEvent || _this.currentEvent;
            if (event.type === 'floating' && prevType !== 'floating') {
                event.allDay = false;
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

            if (event.type === 'fixedAllDay' && (prevType === 'fixed' || prevType === 'floating')) {
                event.allDay = true;
                Event.setStart(event, event.start.startOf('day'));
                event.dur = 1;
            }

            if (event.type === 'fixed' && prevType === 'fixedAllDay') {
                event.allDay = false;
                Event.setStart(event, event.start.startOf('day'));
                event.dur = settings.defaultTaskDuration;
            }

            event.color = settings.eventColor[event.type];
        };

        _this.tasksInResponseSuccessHandler = function (data, successCallback) {
            _this.importFromTasks(data.tasks, data.dirtyTasks);
            successCallback && successCallback();
        };

        _this.tasksInResponseErrorHandler = function (err, errorCallback) {
            if (err.data && err.data.tasks && err.data.dirtyTasks)
                _this.importFromTasks(err.data.tasks, err.data.dirtyTasks);

            ModalService.openModal('dirtyTasks');
            errorCallback && errorCallback();
        };

        _this.saveEvent = function (passedEvent, successCallback, errorCallback) {
            var eventToSave = passedEvent || _this.currentEvent;
            _this.shouldShowLoading = true;
            $timeout(function () {
                if (_this.shouldShowLoading)
                    $ionicLoading.show({template: settings.loadingTemplate});
            }, 500);
            Task.fromEvent(eventToSave).$save({btime: _this.getBTime().unix()}, function (data) {
                _this.tasksInResponseSuccessHandler(data, function () {
                    successCallback && successCallback();
                    _this.shouldShowLoading = false;
                    $ionicLoading.hide();
                });
            }, function (err) {
                _this.tasksInResponseErrorHandler(err, function () {
                    errorCallback && errorCallback();
                    _this.shouldShowLoading = false;
                    $ionicLoading.hide();
                });
            });
        };

        _this.recalcEventConstraints = function (eventPassed) {
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

            if (!_this.recalcEventConstraints(event))
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

            if (!_this.recalcEventConstraints(event))
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

            if (!_this.recalcEventConstraints(event))
                event.error = 'Impossible to schedule due to constraints';

            else {

                if (!event.needs)
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

            if (!_this.recalcEventConstraints(event))
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

        _this.processEventDuration = function (eventPassed) {
            var event = eventPassed ? eventPassed : _this.currentEvent;

            DateUtils.saveDurText(event);

            if (event.type === 'fixedAllDay' || event.type === 'fixed') {
                var toAddMinutes = (event.type === 'fixedAllDay' ? 1440 : settings.minuteGranularity) * event.dur;
                Event.setEnd(event, event.start.clone().add(toAddMinutes, 'minutes'));
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

            toReturn.second(0);
            return toReturn;
        };
    });

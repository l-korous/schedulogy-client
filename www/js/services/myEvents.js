angular.module('Schedulogy')
    .service('MyEvents', function (moment, settings, Event, $ionicLoading, Task, $ionicModal, DateUtils, $rootScope, $timeout, $q) {
        var _this = this;
        _this.events = [];

        _this.refresh = function () {
            Task.query({btime: _this.getBTime().unix()}, function (data) {
                _this.importFromTasks(data.tasks);
                $rootScope.$broadcast('MyEventsLoaded');
            }, function (err) {
                console.log('Task.query - error');
                if (err.data && err.data.tasks) {
                    _this.importFromTasks(err.data.tasks);
                    $rootScope.$broadcast('MyEventsLoaded');
                }
            });
        };

        _this.importFromTasks = function (tasks) {
            _this.events.splice(0, _this.events.length);

            // Very important - we need to set BTime for accurate calculation of constraints of all created Events.
            Event.setBTime(_this.getBTime());

            tasks.forEach(function (task) {
                _this.events.push(Event.toEvent(task));
            });

            _this.events.forEach(function (event) {
                _this.fillBlocksAndNeedsForShow(event);
            });

            if (_this.currentEvent && _this.currentEvent._id) {
                var eventToSet = _this.events.find(function (event) {
                    return event._id === _this.currentEvent._id;
                });
                if (eventToSet)
                    _this.currentEvent = eventToSet;
            }
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
            var _this = this;
            if (event.blocks) {
                event.blocksForShow.splice(0, event.blocksForShow.length);
                event.blocks.forEach(function (dep) {
                    var depObject = _this.events.find(function (event) {
                        if (event._id === dep)
                            return true;
                    });
                    if (depObject)
                        event.blocksForShow.push({_id: depObject._id, title: depObject.title, type: depObject.type, startDateText: depObject.startDateText, startTimeText: depObject.startTimeText, dueDateText: depObject.dueDateText, dueTimeText: depObject.dueTimeText});
                    else
                        console.log('Error: dependent task not exists: ' + dep);
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
                    else
                        console.log('Error: prerequisite not exists: ' + dep);
                });
            }
        };

        _this.findEventById = function (passedEventId) {
            return _this.events.find(function (event) {
                return event._id === passedEventId;
            });
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
                _this.importFromTasks(data.tasks);
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

        _this.deleteAll = function () {
            _this.shouldShowLoading = true;
            $timeout(function () {
                if (_this.shouldShowLoading)
                    $ionicLoading.show({template: settings.loadingTemplate});
            }, 500);

            Task.deleteAll({}, function (data, headers) {
                _this.importFromTasks(data.tasks);
                _this.shouldShowLoading = false;
                $ionicLoading.hide();
            }, function (err) {
                _this.shouldShowLoading = false;
                $ionicLoading.hide();

                // error callback
                console.log(err);
            });
        };

        _this.deleteEventById = function (passedEventId, successCallback, errorCallback) {
            _this.deleteEvent(this.findEventById(passedEventId), successCallback, errorCallback);
        };

        _this.handleChangeOfEventType = function () {
            if (_this.currentEvent.dur > settings.maxEventDuration[_this.currentEvent.type]) {
                _this.currentEvent.dur = settings.maxEventDuration[_this.currentEvent.type];
                _this.updateEndDateTimeWithDuration();
            }
            if (_this.currentEvent.type === 'floating') {
                var startHourOffset = (DateUtils.toMinutes(_this.currentEvent.due) - _this.currentEvent.dur * settings.minuteGranularity) - (settings.startHour * 60);
                if (startHourOffset < 0)
                    _this.currentEvent.due.add(-startHourOffset, 'm');
                var endHourOffset = (settings.endHour * 60) - (DateUtils.toMinutes(_this.currentEvent.due) - _this.currentEvent.dur * settings.minuteGranularity);
                if (endHourOffset < 0)
                    _this.currentEvent.due.add(endHourOffset, 'm');

                _this.currentEvent.dueDateText = _this.currentEvent.due.format(settings.dateFormat);
                _this.currentEvent.dueTimeText = _this.currentEvent.due.format(settings.timeFormat);
            }
            _this.currentEvent.color = settings.eventColor[_this.currentEvent.type];
            _this.recalcConstraints();
        };

        _this.tasksInResponseSuccessHandler = function (data, successCallback) {
            _this.importFromTasks(data.tasks);
            successCallback && successCallback();
            _this.shouldShowLoading = false;
            $ionicLoading.hide();
        };

        _this.tasksInResponseErrorHandler = function (err, errorCallback) {
            if (err.data.tasks)
                _this.importFromTasks(err.data.tasks);

            _this.openErrorModal();
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

        // Task edit modal.
        $ionicModal.fromTemplateUrl('templates/errorModal.html', {
            animation: 'animated zoomIn',
            $scope: _this
        }).then(function (modal) {
            _this.errorModal = modal;
        });
        _this.openErrorModal = function () {
            _this.errorModal.show();
        };
        $rootScope.closeErrorModal = function () {
            _this.errorModal.hide();
        };

        _this.recalcConstraints = function () {
            $ionicLoading.show({template: settings.loadingTemplate});

            var defer = $q.defer();

            // Very important - we need to set BTime for accurate calculation of constraints of all created Events.
            Event.setBTime(_this.getBTime());

            Task.fromEvent(this.currentEvent).$checkConstraints({btime: _this.getBTime().unix()}, function (data) {
                $ionicLoading.hide();
                var constraintProcessResult = Event.processConstraint(_this.currentEvent, data);
                if (constraintProcessResult) {
                    _this.currentEvent = constraintProcessResult;
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

        _this.addDependency = function (eventId) {
            if (!_this.recalcConstraints())
                _this.currentEvent.error = 'Impossible to schedule due to constraints';

            else {
                _this.currentEvent.blocks.push(eventId);
                _this.fillBlocksAndNeedsForShow(this.currentEvent);
                eventId = null;
            }
        };

        _this.removeDependency = function (event) {
            if (!_this.recalcConstraints())
                _this.currentEvent.error = 'Impossible to schedule due to constraints';

            else {
                for (var i = _this.currentEvent.blocks.length - 1; i >= 0; i--) {
                    if (this.currentEvent.blocks[i] === event._id) {
                        _this.currentEvent.blocks.splice(i, 1);
                        _this.currentEvent.blocksForShow.splice(i, 1);
                    }
                }
            }
        };

        _this.addPrerequisite = function (eventId) {

            if (!eventId)
                return;

            if (!_this.recalcConstraints())
                _this.currentEvent.error = 'Impossible to schedule due to constraints';

            else {

                if (!this.currentEvent.needs)
                    _this.currentEvent.needs = [];

                _this.currentEvent.needs.push(eventId);
                _this.fillBlocksAndNeedsForShow(this.currentEvent);
                eventId = null;
            }
        };

        _this.removePrerequisite = function (event) {
            if (!event)
                return;

            if (!_this.recalcConstraints())
                _this.currentEvent.error = 'Impossible to schedule due to constraints';

            else {
                for (var i = _this.currentEvent.needs.length - 1; i >= 0; i--) {
                    if (this.currentEvent.needs[i] === event._id) {
                        _this.currentEvent.needs.splice(i, 1);
                        _this.currentEvent.needsForShow.splice(i, 1);
                    }
                }
            }
        };

        _this.updateEndDateTimeWithDuration = function () {
            DateUtils.saveDurText(_this.currentEvent);

            if (_this.currentEvent.type === 'fixedAllDay' || _this.currentEvent.type === 'fixed') {
                var toAddMinutes = (_this.currentEvent.type === 'fixedAllDay' ? 1440 : settings.minuteGranularity) * _this.currentEvent.dur;
                _this.currentEvent.end = _this.currentEvent.start.clone().add(toAddMinutes, 'minutes');

                // For all-day events, we are displaying the end day the same as the current one.
                if (_this.currentEvent.type === 'fixedAllDay') {
                    var custom_end = _this.currentEvent.start.clone();
                    _this.currentEvent.endDateText = custom_end.format(settings.dateFormat);
                    _this.currentEvent.endTimeText = custom_end.format(settings.timeFormat);
                }
                else if (_this.currentEvent.type === 'fixed') {
                    _this.currentEvent.endDateText = _this.currentEvent.end.format(settings.dateFormat);
                    _this.currentEvent.endTimeText = _this.currentEvent.end.format(settings.timeFormat);
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

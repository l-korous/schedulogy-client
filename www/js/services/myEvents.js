angular.module('Schedulogy')
    .service('MyEvents', function (moment, settings, Event, $ionicLoading, Task, $ionicModal, DateUtils) {
        this.events = [];
        this.curr = null;
        var _this = this;

        this.refreshEvents = function () {
            $ionicLoading.show({template: settings.loadingTemplate});

            Task.query({btime: this.getBTime().unix()}, function (data) {
                _this.importFromTasks(data.tasks);
                $ionicLoading.hide();
            }, function (err) {
                console.log('Task.query - error');
                _this.importFromTasks(err.data.tasks);
                $ionicLoading.hide();
            });
        };

        this.importFromTasks = function (tasks) {
            _this.events.splice(0, _this.events.length);

            tasks.forEach(function (task) {
                _this.events.push(Event.toEvent(task, _this.getBTime()));
            });

            _this.events.forEach(function (event) {
                _this.fillBlocksAndNeedsForShow(event);
            });

            if (_this.currentEvent && _this.currentEvent._id) {
                var eventToSet = _this.events.find(function (event) {
                    return event._id === _this.currentEvent._id;
                });
                eventToSet && Event.updateEvent(_this.currentEvent, eventToSet);
            }
        };

        this.emptyCurrentEvent = function () {
            var btime = this.getBTime();
            var btimePlusDuration = btime.clone().add(settings.defaultTaskDuration / settings.minuteGranularity, 'm');

            this.currentEvent = {
                new : true,
                stick: true,
                type: settings.defaultTaskType,
                dur: settings.defaultTaskDuration,
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

        this.fillBlocksAndNeedsForShow = function (event) {
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

        this.findEventById = function (passedEventId) {
            return this.events.find(function (event) {
                return event._id === passedEventId;
            });
        };

        this.getCurrentEvents = function (now) {
            return $.grep(this.events, function (event) {
                return ((event.start < now) && (event.end > now));
            });
        };

        this.deleteEvent = function (passedEvent) {
            var eventToDelete = passedEvent || this.currentEvent;

            $ionicLoading.show({
                template: settings.loadingTemplate
            });

            Task.fromEvent(eventToDelete).$remove({btime: this.getBTime().unix(), taskId: eventToDelete._id}, function (data, headers) {
                _this.importFromTasks(data.tasks);
                $ionicLoading.hide();
            }, function (err) {
                $ionicLoading.hide();

                // error callback
                console.log(err);
            });
        };

        this.deleteAll = function (passedEvent) {
            $ionicLoading.show({template: settings.loadingTemplate});

            Task.deleteAll({}, function (data, headers) {
                _this.importFromTasks(data.tasks);
                $ionicLoading.hide();
            }, function (err) {
                $ionicLoading.hide();

                // error callback
                console.log(err);
            });
        };

        this.deleteEventById = function (passedEventId) {
            this.deleteEvent(this.findEventById(passedEventId));
        };

        this.handleChangeOfEventType = function (eventPassed) {
            var event = eventPassed || this.currentEvent;
            if (event.dur > settings.maxEventDuration[event.type])
                event.dur = settings.maxEventDuration[event.type];
            this.updateEndDateTimeWithDuration(event);
            event.color = settings.eventColor[event.type];
        };

        this.tasksInResponseSuccessHandler = function (data, successCallback) {
            _this.importFromTasks(data.tasks);
            successCallback && successCallback();
            $ionicLoading.hide();
        };

        this.tasksInResponseErrorHandler = function (err, errorCallback) {
            $ionicLoading.hide();
            if (err.data.tasks)
                _this.importFromTasks(err.data.tasks);

            _this.openErrorModal();
            errorCallback && errorCallback();
        };

        this.saveEvent = function (passedEvent, successCallback, errorCallback) {
            var eventToSave = passedEvent || _this.currentEvent;
            $ionicLoading.show({template: settings.loadingTemplate});
            Task.fromEvent(eventToSave).$save({btime: this.getBTime().unix()}, function (data) {
                _this.tasksInResponseSuccessHandler(data, successCallback);
            },
                function (err) {
                    _this.tasksInResponseErrorHandler(err, errorCallback);
                });
        };

        // Task edit modal.
        $ionicModal.fromTemplateUrl('templates/popovers/error_modal.html', {
            animation: 'animated zoomIn'
        }).then(function (modal) {
            _this.errorModal = modal;
        });
        _this.openErrorModal = function () {
            _this.errorModal.show();
        };
        _this.closeErrorModal = function () {
            _this.errorModal.hide();
        };

        this.recalcConstraints = function () {
            $ionicLoading.show({
                template: settings.loadingTemplate
            });

            Task.fromEvent(this.currentEvent).$checkConstraints({btime: _this.getBTime().unix()}, function (data, headers) {
                Event.processConstraint(_this.currentEvent, data, _this.getBTime());
                $ionicLoading.hide();
            }, function (err) {
                $ionicLoading.hide();

                // error callback
                console.log(err);
            });
        };

        this.addDependency = function (eventId) {
            this.currentEvent.blocks.push(eventId);
            this.fillBlocksAndNeedsForShow(this.currentEvent);
            eventId = null;

            this.recalcConstraints();
        };

        this.removeDependency = function (event) {
            for (var i = this.currentEvent.blocks.length - 1; i >= 0; i--) {
                if (this.currentEvent.blocks[i] === event._id) {
                    this.currentEvent.blocks.splice(i, 1);
                    this.currentEvent.blocksForShow.splice(i, 1);
                }
            }
            this.recalcConstraints();
        };

        this.addPrerequisite = function (eventId) {
            if (!eventId)
                return;

            if (!this.currentEvent.needs)
                this.currentEvent.needs = [];

            this.currentEvent.needs.push(eventId);
            this.fillBlocksAndNeedsForShow(this.currentEvent);
            eventId = null;

            this.recalcConstraints();
        };

        this.removePrerequisite = function (event) {
            if (!event)
                return;
            for (var i = this.currentEvent.needs.length - 1; i >= 0; i--) {
                if (this.currentEvent.needs[i] === event._id) {
                    this.currentEvent.needs.splice(i, 1);
                    this.currentEvent.needsForShow.splice(i, 1);
                }
            }

            this.recalcConstraints();
        };

        this.updateEndDateTimeWithDuration = function (eventPassed) {
            var event = eventPassed || this.currentEvent;

            DateUtils.saveDurText(event);

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
        };

        this.getBTime = function () {
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
            if (toReturn.minute() === 0)
                toReturn.add(1, 'hour');

            // Move to next day.
            if (toReturn.hours() > settings.endHour) {
                toReturn.hours(settings.startHour);
                toReturn.minutes(0);
                toReturn.day(toReturn.day() + 1);
            }
            // Move Sat + Sun to Mon.
            if (toReturn.day() === 0 || toReturn.day() > 6) {
                toReturn.hours(settings.startHour);
                toReturn.minutes(0);
                if (toReturn.day() === 0)
                    toReturn.day(1);
                else
                    toReturn.day(8);
            }

            this.getCurrentEvents(toReturn).forEach(function (currentEvent) {
                toReturn = (currentEvent.end > toReturn ? currentEvent.end : toReturn);
            });

            toReturn.second(0);
            return toReturn;
        };

        //////// Done at start
        this.refreshEvents();
    });

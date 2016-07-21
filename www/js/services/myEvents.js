angular.module('Schedulogy')
    .service('MyEvents', function (moment, settings, Event, $ionicLoading, Task) {
        this.events = [];
        this.curr = null;

        this.importFromTasks = function (tasks) {
            var _this = this;
            this.events.splice(0, this.events.length);

            tasks.forEach(function (task) {
                _this.events.push(Event.toEvent(task));
            });

            this.events.forEach(function (event) {
                _this.fillBlocksAndNeedsForShow(event);
            });
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
                        event.blocksForShow.push({_id: depObject._id, title: depObject.title, startDateText: depObject.startDateText, startTimeText: depObject.startTimeText});
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
                        event.needsForShow.push({_id: depObject._id, title: depObject.title, startDateText: depObject.startDateText, startTimeText: depObject.startTimeText});
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
                template: 'Loading...'
            });

            Task.fromEvent(eventToDelete).$remove({btime: this.getBTime().unix(), taskId: eventToDelete._id}, function (data, headers) {
                this.importFromTasks(data.tasks);
                $ionicLoading.hide();
            }, function (err) {
                $ionicLoading.hide();

                // error callback
                console.log(err);
            });
        };

        this.deleteEventById = function (passedEventId) {
            this.deleteEvent(MyEvents.findEventById(passedEventId));
        };

        this.saveEvent = function (passedEvent) {
            var eventToSave = passedEvent || this.currentEvent;
            $ionicLoading.show({
                template: 'Loading...'
            });
            Task.fromEvent(eventToSave).$save({btime: this.getBTime().unix()}, function (data, headers) {
                this.importFromTasks(data.tasks);
                $ionicLoading.hide();
            },
                function (err) {
                    $ionicLoading.hide();
                    // error callback
                    console.log(err);
                });
        };

        this.addDependency = function (eventId) {
            this.currentEvent.blocks.push(eventId);
            this.fillBlocksAndNeedsForShow(this.currentEvent);
            eventId = null;
        };

        this.removeDependency = function (event) {
            for (var i = this.currentEvent.blocks.length - 1; i >= 0; i--) {
                if (this.currentEvent.blocks[i] === event._id) {
                    this.currentEvent.blocks.splice(i, 1);
                    this.currentEvent.blocksForShow.splice(i, 1);
                }
            }
        };

        this.addPrerequisite = function (eventId) {
            this.currentEvent.needs.push(eventId);
            this.fillBlocksAndNeedsForShow(this.currentEvent);
            eventId = null;
        };

        this.removePrerequisite = function (event) {
            for (var i = this.currentEvent.needs.length - 1; i >= 0; i--) {
                if (this.currentEvent.needs[i] === event._id) {
                    this.currentEvent.needs.splice(i, 1);
                    this.currentEvent.needsForShow.splice(i, 1);
                }
            }
        };

        this.updateEndDateTimeWithDuration = function (eventPassed) {
            var event = eventPassed || MyEvents.currentEvent;

            event.end = event.start.clone().add(event.dur, event.type === 'fixedAllDay' ? 'days' : 'hours');

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
            var toReturn = settings.fixedBTime ? moment(settings.fixedBTime.date) : moment(new Date()).add('hours', 1).minutes(0).seconds(0);

            this.getCurrentEvents(toReturn).forEach(function (currentEvent) {
                toReturn = (currentEvent.end > toReturn ? currentEvent.end : toReturn);
            });

            return toReturn;
        };
    });

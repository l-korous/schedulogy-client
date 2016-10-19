angular.module('Schedulogy')
    .service('MyItems', function (moment, settings, Item, Task, ModalService, DateUtils, $rootScope, $timeout, $q) {
        var _this = this;
        _this.items = [];
        _this.calendarItems = [_this.items];
        _this.dirtyItems = [];

        _this.refresh = function () {
            Task.query({btime: _this.getBTime().unix()}, function (data) {
                _this.importFromTasks(data.tasks, data.dirtyTasks);
                $rootScope.$broadcast('MyItemsLoaded');
            }, function (err) {
                console.log('Task.query - error');
                if (err.data && err.data.tasks && err.data.dirtyTasks) {
                    _this.importFromTasks(err.data.tasks, err.data.dirtyTasks);
                    $rootScope.$broadcast('MyItemsLoaded');
                }
            });
        };

        _this.importFromTasks = function (tasks, dirtyTasks) {
            if (dirtyTasks.length > 0)
                ModalService.openModal('dirtyTasks');

            var processArray = function (taskArray, itemArray) {
                itemArray.splice(0, itemArray.length);
                
                // Very important - we need to set BTime for accurate calculation of constraints of all created Events.
                Item.setBTime(_this.getBTime());

                taskArray.forEach(function (task) {
                    itemArray.push(Item.fromServer(task));
                });

                if (_this.currentItem && _this.currentItem._id) {
                    var itemToSet = itemArray.find(function (item) {
                        return item._id === _this.currentItem._id;
                    });
                    if (itemToSet)
                        _this.currentItem = itemToSet;
                }
            };
            processArray(tasks, _this.items);
            processArray(dirtyTasks, _this.dirtyItems);

            _this.items.forEach(function (item) {
                _this.fillBlocksAndNeedsForShow(item);
            });
            
            _this.dirtyItems.forEach(function (item) {
                _this.fillBlocksAndNeedsForShow(item);
            });

            // Store the scroll, so that after the modal is hidden, we can re-establish the scroll.
            _this.scrollTop = $('.fc-scroller').scrollTop();

            // Scroll to where I was before.
            setTimeout(function () {
                $('.fc-scroller').scrollTop(_this.scrollTop);
            });
        };

        _this.setCurrentItem = function (itemId) {
            _this.currentItem = _this.items.find(function (item) {
                if (item._id === itemId)
                    return true;
            });
        };

        _this.newCurrentItem = function (type) {
            _this.currentItem = {
                stick: true,
                type: type,
                title: '',
                desc: ''
            };

            switch (type) {
                case 'event':
                    var startTime = _this.getBTime().clone().add(settings.defaultHourShiftFromNow, 'h');
                    var endTime = startTime.clone().add(settings.defaultTaskDuration / settings.minuteGranularity, 'm');
                    var dur = settings.defaultTaskDuration[0];
                    _this.currentItem = angular.extend(_this.currentItem, {
                        resource: $rootScope.myResourceId,
                        blocks: [],
                        allDay: false,
                        blocksForShow: [],
                        constraint: {
                            start: null,
                            end: null
                        }
                    });
                    Item.setStart(_this.currentItem, startTime);
                    Item.setDur(_this.currentItem, dur);
                    Item.setEnd(_this.currentItem, endTime);
                    break;
                case 'task':
                    var startTime = _this.getBTime().clone().add(settings.defaultHourShiftFromNow, 'h');
                    var endTime = startTime.clone().add(settings.defaultTaskDuration / settings.minuteGranularity, 'm');
                    var dur = settings.defaultTaskDuration[0];
                    _this.currentItem = angular.extend(_this.currentItem, {
                        admissibleResources: [$rootScope.myResourceId],
                        blocks: [],
                        blocksForShow: [],
                        allDay: false,
                        needs: [],
                        needsForShow: [],
                        constraint: {
                            start: null,
                            end: null
                        }
                    });
                    Item.setStart(_this.currentItem, startTime);
                    Item.setDur(_this.currentItem, dur);
                    Item.setDue(_this.currentItem, endTime);
                    _this.recalcEventConstraints();
                    break;
                case 'reminder':
                    var startTime = _this.getBTime().clone();
                    _this.currentItem = angular.extend(_this.currentItem, {
                        resource: $rootScope.myResourceId,
                        allDay: true
                    });
                    Item.setStart(_this.currentItem, startTime);
                    break;
            }
        };

        _this.fillBlocksAndNeedsForShow = function (item) {
            if (item.blocks) {
                item.blocksForShow.splice(0, item.blocksForShow.length);
                item.blocks.forEach(function (dep) {
                    var depObject = _this.items.find(function (item) {
                        if (item._id === dep)
                            return true;
                    });
                    if (depObject)
                        item.blocksForShow.push({_id: depObject._id, title: depObject.title, type: depObject.type, startDateText: depObject.startDateText, startTimeText: depObject.startTimeText, dueDateText: depObject.dueDateText, dueTimeText: depObject.dueTimeText});
                    else {
                        depObject = _this.dirtyItems.find(function (item) {
                            if (item._id === dep)
                                return true;
                        });
                        item.blocksForShow.push({_id: depObject._id, title: depObject.title, type: depObject.type, startDateText: depObject.startDateText, startTimeText: depObject.startTimeText, dueDateText: depObject.dueDateText, dueTimeText: depObject.dueTimeText});
                        if (!depObject)
                            console.log('Error: dependent task not exists: ' + dep);
                    }
                });
            }

            if (item.needs) {
                item.needsForShow.splice(0, item.needsForShow.length);
                item.needs.forEach(function (dep) {
                    var depObject = _this.items.find(function (item) {
                        if (item._id === dep)
                            return true;
                    });
                    if (depObject)
                        item.needsForShow.push({_id: depObject._id, title: depObject.title, type: depObject.type, startDateText: depObject.startDateText, startTimeText: depObject.startTimeText, dueDateText: depObject.dueDateText, dueTimeText: depObject.dueTimeText});
                    else {
                        depObject = _this.dirtyItems.find(function (item) {
                            if (item._id === dep)
                                return true;
                        });
                        item.needsForShow.push({_id: depObject._id, title: depObject.title, type: depObject.type, startDateText: depObject.startDateText, startTimeText: depObject.startTimeText, dueDateText: depObject.dueDateText, dueTimeText: depObject.dueTimeText});
                        if (!depObject)
                            console.log('Error: prerequisite task not exists: ' + dep);
                    }
                });
            }
        };

        _this.findEventById = function (passedItemId) {
            var itemToDelete = _this.items.find(function (item) {
                return item._id === passedItemId;
            });
            if (!itemToDelete)
                return _this.dirtyItems.find(function (item) {
                    return item._id === passedItemId;
                });
            return itemToDelete;
        };

        _this.getCurrentEvents = function (now) {
            return $.grep(this.items, function (item) {
                return ((item.start <= now) && (item.end >= now));
            });
        };

        _this.deleteEvent = function (passedItem, successCallback, errorCallback) {
            var itemToDelete = passedItem || _this.currentItem;

            _this.shouldShowLoading = true;
            $timeout(function () {
                if (_this.shouldShowLoading)
                    $rootScope.isLoading = true;
            }, 500);

            Task.toServer(itemToDelete).$remove({btime: _this.getBTime().unix(), taskId: itemToDelete._id}, function (data, headers) {
                _this.importFromTasks(data.tasks, data.dirtyTasks);
                _this.shouldShowLoading = false;
                $rootScope.isLoading = false;
                successCallback && successCallback();
            }, function (err) {
                _this.shouldShowLoading = false;
                $rootScope.isLoading = false;
                errorCallback && errorCallback();
                console.log(err);
            });
        };

        _this.deleteAll = function (successCallback, errorCallback) {
            _this.shouldShowLoading = true;
            $timeout(function () {
                if (_this.shouldShowLoading)
                    $rootScope.isLoading = true;
            }, 500);

            Task.deleteAll({}, function (data) {
                _this.importFromTasks(data.tasks, data.dirtyTasks);
                _this.shouldShowLoading = false;
                $rootScope.isLoading = false;
                successCallback && successCallback();
            }, function (err) {
                _this.shouldShowLoading = false;
                $rootScope.isLoading = false;
                errorCallback && errorCallback();
                // error callback
                console.log(err);
            });
        };

        _this.deleteItemById = function (passedItemId, successCallback, errorCallback) {
            _this.deleteEvent(this.findEventById(passedItemId), successCallback, errorCallback);
        };

        _this.imposeEventDurationBound = function (passedItem) {
            var item = passedItem || _this.currentItem;

            if (item.dur > settings.maxEventDuration[item.type])
                item.dur = settings.maxEventDuration[item.type];
        };

        // (!!!) Might change duration and start.
        _this.processChangeOfEventType = function (passedItem, prevType) {
            var item = passedItem || _this.currentItem;
            if (item.type === 'task' && prevType !== 'task') {
                item.allDay = false;
                var dueMinutes = DateUtils.toMinutes(item.due);
                if (!dueMinutes)
                    dueMinutes = 1440;
                var startHourOffset = (dueMinutes - item.dur * settings.minuteGranularity) - (settings.startHour * 60);
                if (startHourOffset < 0)
                    item.due.add(-startHourOffset, 'm');
                var endHourOffset = (settings.endHour * 60) - (dueMinutes - item.dur * settings.minuteGranularity);
                if (endHourOffset < 0)
                    item.due.add(endHourOffset, 'm');

                item.resource = item.admissibleResources[0];
                Item.setDue(item);
            }
            item.color = settings.itemColor[item.type];
        };

        _this.tasksInResponseSuccessHandler = function (data, successCallback) {
            _this.importFromTasks(data.tasks, data.dirtyTasks);
            successCallback && successCallback();
        };

        _this.tasksInResponseErrorHandler = function (err, errorCallback) {
            if (err.data && err.data.tasks && err.data.dirtyTasks)
                _this.importFromTasks(err.data.tasks, err.data.dirtyTasks);

            errorCallback && errorCallback();
        };

        _this.saveItem = function (passedItem, successCallback, errorCallback) {
            var itemToSave = passedItem || _this.currentItem;
            _this.shouldShowLoading = true;
            $timeout(function () {
                if (_this.shouldShowLoading)
                    $rootScope.isLoading = true;
            }, 500);
            Task.toServer(itemToSave).$save({btime: _this.getBTime().unix()}, function (data) {
                _this.tasksInResponseSuccessHandler(data, function () {
                    successCallback && successCallback();
                    _this.shouldShowLoading = false;
                    $rootScope.isLoading = false;
                });
            }, function (err) {
                _this.tasksInResponseErrorHandler(err, function () {
                    errorCallback && errorCallback();
                    _this.shouldShowLoading = false;
                    $rootScope.isLoading = false;
                });
            });
        };

        _this.recalcEventConstraints = function (itemPassed) {
            $rootScope.isLoading = true;

            var item = itemPassed ? itemPassed : _this.currentItem;

            var defer = $q.defer();

            // Very important - we need to set BTime for accurate calculation of constraints of all created Events.
            Item.setBTime(_this.getBTime());

            Task.toServer(item).$checkConstraints({btime: _this.getBTime().unix()}, function (data) {
                $rootScope.isLoading = false;
                var constraintProcessResult = Item.processConstraint(item, data);
                if (constraintProcessResult) {
                    item = constraintProcessResult;
                    defer.resolve(true);
                }
                else
                    defer.resolve(false);
            }, function (err) {
                $rootScope.isLoading = false;
                defer.resolve(true);
                // error callback
                console.log(err);
            });
            return defer.promise;
        };

        _this.addDependency = function (itemPassed, dependencyId) {
            if (!dependencyId)
                return;

            var item = itemPassed ? itemPassed : _this.currentItem;

            if (!_this.recalcEventConstraints(item))
                item.error = 'Impossible to schedule due to constraints';

            else {
                item.blocks.push(dependencyId);
                _this.fillBlocksAndNeedsForShow(item);
                dependencyId = null;
            }
        };

        _this.removeDependency = function (itemPassed, dependency) {
            if (!dependency)
                return;

            var item = itemPassed ? itemPassed : _this.currentItem;

            if (!_this.recalcEventConstraints(item))
                item.error = 'Impossible to schedule due to constraints';

            else {
                for (var i = item.blocks.length - 1; i >= 0; i--) {
                    if (item.blocks[i] === dependency._id) {
                        item.blocks.splice(i, 1);
                        item.blocksForShow.splice(i, 1);
                    }
                }
            }
        };

        _this.addPrerequisite = function (itemPassed, prerequisiteId) {
            if (!prerequisiteId)
                return;

            var item = itemPassed ? itemPassed : _this.currentItem;

            if (!_this.recalcEventConstraints(item))
                item.error = 'Impossible to schedule due to constraints';

            else {

                if (!item.needs)
                    item.needs = [];

                item.needs.push(prerequisiteId);
                _this.fillBlocksAndNeedsForShow(item);
                prerequisiteId = null;
            }
        };

        _this.removePrerequisite = function (itemPassed, prerequisite) {
            if (!prerequisite)
                return;

            var item = itemPassed ? itemPassed : _this.currentItem;

            if (!_this.recalcEventConstraints(item))
                item.error = 'Impossible to schedule due to constraints';

            else {
                for (var i = item.needs.length - 1; i >= 0; i--) {
                    if (item.needs[i] === prerequisite._id) {
                        item.needs.splice(i, 1);
                        item.needsForShow.splice(i, 1);
                    }
                }
            }
        };

        _this.processEventDuration = function (itemPassed) {
            var item = itemPassed ? itemPassed : _this.currentItem;

            Item.setDur(item);

            if (item.type === 'event') {
                var toAddMinutes = (item.allDay ? 1440 : settings.minuteGranularity) * item.dur;
                Item.setEnd(item, item.start.clone().add(toAddMinutes, 'minutes'));
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

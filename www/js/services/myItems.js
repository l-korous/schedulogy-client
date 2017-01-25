angular.module('Schedulogy')
    .service('MyItems', function (moment, settings, constants, Item, Task, ModalService, DateUtils, $rootScope, $timeout, $q) {
        var _this = this;
        _this.items = [];
        _this.calendarItems = [_this.items];
        _this.dirtyItems = [];

        _this.refresh = function () {
            Task.query({btime: _this.getBTime().unix()}, function (data) {
                _this.importFromTasks(data.tasks, data.dirtyTasks);
            }, function (err) {
                if (err.data && err.data.tasks && err.data.dirtyTasks) {
                    _this.importFromTasks(err.data.tasks, err.data.dirtyTasks);
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
                    var startTime = _this.getBTime().clone().add(constants.defaultHourShiftFromNow, 'h');
                    var endTime = startTime.clone().add(constants.defaultTaskDuration / constants.minuteGranularity, 'm');
                    var dur = constants.defaultTaskDuration[0];
                    _this.currentItem = angular.extend(_this.currentItem, {
                        resource: $rootScope.myResourceId,
                        blocks: [],
                        allDay: false,
                        blocksForShow: [],
                        notifications:[],
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
                    var startTime = _this.getBTime().clone().add(constants.defaultHourShiftFromNow, 'h');
                    var endTime = startTime.clone().add(constants.defaultTaskDuration / constants.minuteGranularity, 'm');
                    var dur = constants.defaultTaskDuration[0];
                    _this.currentItem = angular.extend(_this.currentItem, {
                        admissibleResources: [$rootScope.myResourceId],
                        blocks: [],
                        blocksForShow: [],
                        allDay: false,
                        notifications:[],
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
                    if (!depObject) {
                        depObject = _this.dirtyItems.find(function (item) {
                            if (item._id === dep)
                                return true;
                        });
                    }
                    if (!depObject)
                        console.log('Error: dependent task not exists: ' + dep);
                    else
                        item.blocksForShow.push({title: depObject.title, shortInfo: depObject.shortInfo, _id: depObject._id});
                });
            }

            if (item.needs) {
                item.needsForShow.splice(0, item.needsForShow.length);
                item.needs.forEach(function (dep) {
                    var depObject = _this.items.find(function (item) {
                        if (item._id === dep)
                            return true;
                    });
                    if (!depObject) {
                        depObject = _this.dirtyItems.find(function (item) {
                            if (item._id === dep)
                                return true;
                        });
                    }
                    if (!depObject)
                        console.log('Error: prerequisite task not exists: ' + dep);
                    else
                        item.needsForShow.push({title: depObject.title, shortInfo: depObject.shortInfo, _id: depObject._id});
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

        _this.processDeleteRequest = function (passedItemId, successCallback, errorCallback) {
            var itemToDelete = this.findEventById(passedItemId);
            if (!itemToDelete.repetition)
                _this.deleteItem(itemToDelete, successCallback, errorCallback);
            else {
                ModalService.openModal('singleOrRepetition');
                ModalService.modals.singleOrRepetition.scope.setCallback(function (resolution) {
                    if (resolution === 'single') {
                        _this.deleteItem(itemToDelete, successCallback, errorCallback);
                    }
                    else if (resolution === 'repetition') {
                        _this.deleteItemsByRepetitionId(itemToDelete.repetition._id, successCallback, errorCallback);
                    }
                });
            }
        };
        
        _this.deleteItemsByRepetitionId = function (repetitionId, successCallback, errorCallback) {
            _this.shouldShowLoading = true;
            $timeout(function () {
                if (_this.shouldShowLoading)
                    $rootScope.isLoading = true;
            }, 500);

            Task.removeByRepetitionId({repetitionId: repetitionId}, function (data, headers) {
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

        _this.deleteItem = function (itemToDelete, successCallback, errorCallback) {
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

        _this.imposeEventDurationBound = function (passedItem) {
            var item = passedItem || _this.currentItem;

            if (item.dur > constants.maxEventDuration[item.type])
                item.dur = constants.maxEventDuration[item.type];
        };

        // (!!!) Might change duration and start.
        _this.processChangeOfEventType = function (passedItem, prevType) {
            var item = passedItem || _this.currentItem;
            if (item.type === 'task' && prevType !== 'task') {
                item.allDay = false;
                var dueMinutes = DateUtils.toMinutes(item.due);
                if (!dueMinutes)
                    dueMinutes = 1440;
                var startHourOffset = (dueMinutes - item.dur * constants.minuteGranularity) - (constants.startHour * 60);
                if (startHourOffset < 0)
                    item.due.add(-startHourOffset, 'm');
                var endHourOffset = (constants.endHour * 60) - (dueMinutes - item.dur * constants.minuteGranularity);
                if (endHourOffset < 0)
                    item.due.add(endHourOffset, 'm');

                item.resource = item.admissibleResources[0];
                Item.setDue(item);
            }
            item.color = constants.itemColor(item.type, item.allDay);
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

        _this.processSaveRequest = function (passedItem, successCallback, errorCallback) {
            var itemToSave = passedItem || _this.currentItem;
            if (!itemToSave.repetition || !itemToSave._id)
                _this.saveItem(itemToSave, 0, successCallback, errorCallback);
            else {
                ModalService.openModal('singleOrRepetition');
                ModalService.modals.singleOrRepetition.scope.setCallback(function (resolution) {
                    if (resolution === 'single') {
                        _this.saveItem(itemToSave, 0, successCallback, errorCallback);
                    }
                    else if (resolution === 'repetition') {
                       _this.saveItem(itemToSave, 1, successCallback, errorCallback);
                    }
                });
            }
        };

        _this.saveItem = function (passedItem, updateAllOccurences, successCallback, errorCallback) {
            var itemToSave = passedItem || _this.currentItem;
            _this.shouldShowLoading = true;
            $timeout(function () {
                if (_this.shouldShowLoading)
                    $rootScope.isLoading = true;
            }, 500);
            Task.toServer(itemToSave).$save({btime: _this.getBTime().unix(), updateAllOccurences: updateAllOccurences}, function (data) {
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

            item.blocks.push(dependencyId);
            _this.fillBlocksAndNeedsForShow(item);
            dependencyId = null;

            if (!_this.recalcEventConstraints(item))
                item.error = 'Impossible to schedule due to constraints';
        };

        _this.removeDependency = function (itemPassed, dependency) {
            if (!dependency)
                return;

            var item = itemPassed ? itemPassed : _this.currentItem;

            for (var i = item.blocks.length - 1; i >= 0; i--) {
                if (item.blocks[i] === dependency._id) {
                    item.blocks.splice(i, 1);
                    item.blocksForShow.splice(i, 1);
                }
            }

            if (!_this.recalcEventConstraints(item))
                item.error = 'Impossible to schedule due to constraints';
        };

        _this.addPrerequisite = function (itemPassed, prerequisiteId) {
            if (!prerequisiteId)
                return;

            var item = itemPassed ? itemPassed : _this.currentItem;

            if (!item.needs)
                item.needs = [];

            item.needs.push(prerequisiteId);
            _this.fillBlocksAndNeedsForShow(item);
            prerequisiteId = null;

            if (!_this.recalcEventConstraints(item))
                item.error = 'Impossible to schedule due to constraints';
        };

        _this.removePrerequisite = function (itemPassed, prerequisite) {
            if (!prerequisite)
                return;

            var item = itemPassed ? itemPassed : _this.currentItem;

            for (var i = item.needs.length - 1; i >= 0; i--) {
                if (item.needs[i] === prerequisite._id) {
                    item.needs.splice(i, 1);
                    item.needsForShow.splice(i, 1);
                }
            }

            if (!_this.recalcEventConstraints(item))
                item.error = 'Impossible to schedule due to constraints';
        };

        _this.processEventDuration = function (itemPassed) {
            var item = itemPassed ? itemPassed : _this.currentItem;

            Item.setDur(item);

            if (item.type === 'event') {
                var toAddMinutes = (item.allDay ? 1440 : constants.minuteGranularity) * item.dur;
                Item.setEnd(item, item.start.clone().add(toAddMinutes, 'minutes'));
            }
        };

        _this.getBTime = function () {
            if (settings.fixedBTime.on)
                return moment(settings.fixedBTime.date);

            var toReturn = moment(new Date());
            for (var i = 0; i < (60 / constants.minuteGranularity); i++) {
                var thisPart = (constants.minuteGranularity * (i + 1));
                if (toReturn.minute() < thisPart) {
                    toReturn.minute(thisPart);
                    break;
                }
            }

            // Move to next day.
            if ((toReturn.hours() * 60 + toReturn.minute()) > constants.endHour * 60) {
                toReturn.hours(constants.startHour);
                toReturn.minutes(0);
                toReturn.day(toReturn.day() + 1);
            }
            // Move to startHour (the same day).
            if (toReturn.hours() < constants.startHour) {
                toReturn.hours(constants.startHour);
                toReturn.minutes(0);
            }

            toReturn.second(0);
            return toReturn;
        };
    });

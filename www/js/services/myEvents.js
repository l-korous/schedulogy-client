angular.module('Schedulogy')
    .factory('MyEvents', function (moment, settings, Event) {
        var MyEvents = {
            events: []
        };

        MyEvents.importFromTasks = function (tasks) {
            MyEvents.events.splice(0, MyEvents.events.length);

            tasks.forEach(function (task) {
                MyEvents.events.push(Event.toEvent(task));
            });

            MyEvents.events.forEach(function (event) {
                MyEvents.fillBlocksAndNeedsForShow(event);
            });
        };
        MyEvents.fillBlocksAndNeedsForShow = function (event) {
            if (event.blocks) {
                event.blocksForShow.splice(0, event.blocksForShow.length);
                event.blocks.forEach(function (dep) {
                    var depObject = MyEvents.events.find(function (event) {
                        if (event._id === dep)
                            return true;
                    });
                    event.blocksForShow.push({_id: depObject._id, title: depObject.title, startDateText: depObject.startDateText, startTimeText: depObject.startTimeText});
                });
            }
            
            if (event.needs) {
                event.needsForShow.splice(0, event.needsForShow.length);
                event.needs.forEach(function (dep) {
                    var depObject = MyEvents.events.find(function (event) {
                        if (event._id === dep)
                            return true;
                    });
                    event.needsForShow.push({_id: depObject._id, title: depObject.title, startDateText: depObject.startDateText, startTimeText: depObject.startTimeText});
                });
            }
        };

        MyEvents.findEventById = function (passedEventId) {
            return MyEvents.events.find(function (event) {
                return event._id === passedEventId;
            });
        };

        MyEvents.getCurrentEvents = function (now) {
            return $.grep(MyEvents.events, function (event) {
                return ((event.start < now) && (event.end > now));
            });
        };
        
        return MyEvents;
    });

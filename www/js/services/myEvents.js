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
                MyEvents.fillDepsForShow(event);
            });
        };
        MyEvents.fillDepsForShow = function (event) {
            if (event.deps) {
                event.depsForShow.splice(0, event.depsForShow.length);
                event.deps.forEach(function (dep) {
                    var depObject = MyEvents.events.find(function (event) {
                        if (event._id === dep)
                            return true;
                    });
                    event.depsForShow.push({_id: depObject._id, title: depObject.title, startDateText: depObject.startDateText, startTimeText: depObject.startTimeText});
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

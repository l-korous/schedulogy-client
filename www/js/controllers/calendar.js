angular.module('Scheduler')
    .controller('CalendarCtrl', function ($scope) {
        var week = $scope.week;
        $scope.weekConfig = {
            viewType: "WorkWeek",
            heightSpec: "BusinessHoursNoScroll",
            cssOnly: true,
            cellDuration:60,
            cellHeight:100,
            onEventClick: function (args) {
                console.dir(args.e);
                var modal = new DayPilot.Modal({
                });

            },
            onTimeRangeSelected: function (args) {
                var name = prompt("New event name:", "Event");
                this.clearSelection();
                if (!name)
                    return;
                var e = new DayPilot.Event({
                    start: args.start,
                    end: args.end,
                    id: DayPilot.guid(),
                    resource: args.resource,
                    text: name
                });
                $scope.events.push(e);
                loadEvents();
            }
        };

        $scope.dayConfig = {
            viewType: "Day"
        };

        $scope.navigatorConfig = {
            selectMode: "day",
            showMonths: 3,
            skipMonths: 3,
            onTimeRangeSelected: function (args) {
                $scope.weekConfig.startDate = args.day;
                loadEvents();
            }
        };

        $scope.events = [
            {
                start: new DayPilot.Date("2016-06-28T10:00:00"),
                end: new DayPilot.Date("2016-06-28T14:00:00"),
                id: DayPilot.guid(),
                text: "First Event"
            }
        ];

        $scope.showDay = function () {
            $scope.dayConfig.visible = true;
            $scope.weekConfig.visible = false;
        };

        $scope.showWeek = function () {
            $scope.dayConfig.visible = false;
            $scope.weekConfig.visible = true;
        };
    });

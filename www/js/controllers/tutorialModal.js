angular.module('Schedulogy')
    .controller('TutorialModalCtrl', function ($scope, settings, $sce, ModalService, Hopscotch, $rootScope) {
        $scope.open = function () {
            ModalService.openModalInternal('tutorial');
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('tutorial', $scope, $scope.open, $scope.close);

        $scope.runTour = function (name) {
            Hopscotch.endTour();
            Hopscotch.runTour(name);
        };

        $scope.groups = [
            {
                name: 'Create a Reminder',
                icon: 'ion-android-alarm-clock',
                color: settings.itemColor.reminder,
                id: 1,
                content: $sce.trustAsHtml(
                    '<h2 style="border-left:5px solid ' + settings.itemColor.reminder + '">Reminder</h2>' +
                    '<p>A simple reminder, that keeps moving to the current day, until it is marked as done - at which point it stays at the day when it was marked as done.</p>' +
                    '<p><strong>In order to create a new Reminder, select "New Reminder" from either the left menu (on large screen), or from the top menu (on small screen).</strong></p>' +
                    ($rootScope.smallScreen ? '' : '<div class="row"><div class="col-50 padding-horizontal padding-top">') +
                    ($rootScope.smallScreen ? '' : '<button class="button button-block button-dark" style="background-color:' + settings.itemColor.reminder + '" onclick="angular.element($(\'#tutorialDiv\')).scope().runTour(\'reminder\');event.stopPropagation();">Show me</button>') +
                    ($rootScope.smallScreen ? '' : '</div><div class="col-50 padding-horizontal padding-top">') +
                    '<button class="button button-block button-dark button-outline" onclick="angular.element($(\'#tutorialDiv\')).scope().toggleGroupById(1);event.stopPropagation();">Hide</button>' +
                    ($rootScope.smallScreen ? '' : '</div></div>') +
                    '<h2 style="border-left:5px solid ' + settings.itemColor.reminder + '">Reminder attributes</h2>' +
                    '<p><strong>Title</strong> - A (short) identifier of the Reminder.</p>' +
                    '<p><strong>Description</strong> - Longer description of the Reminder.</p>' +
                    '<p><strong>Resource</strong> - Which Resource (in most cases which \'person\') is this Reminder for.</p>'
                    )
            },
            {
                name: 'Create an Event',
                id: 2,
                icon: 'ion-calendar',
                color: settings.itemColor.event,
                content: $sce.trustAsHtml(
                    '<h2 style="border-left:5px solid ' + settings.itemColor.event + '">Event</h2>' +
                    '<p>Standard events, that have a fixed start (date &amp; time), and a fixed end (date &amp; time). The end is set up with help of Event duration.</p>' +
                    '<p><strong>In order to create a new Event, select "New Event" from either the left menu (on large screen), or from the top menu (on small screen).</strong></p>' +
                    ($rootScope.smallScreen ? '' : '<div class="row"><div class="col-50 padding-horizontal padding-top">') +
                    ($rootScope.smallScreen ? '' : '<button class="button button-block button-dark" style="background-color:' + settings.itemColor.event + '" onclick="angular.element($(\'#tutorialDiv\')).scope().runTour(\'event\');event.stopPropagation();">Show me</button>') +
                    ($rootScope.smallScreen ? '' : '</div><div class="col-50 padding-horizontal padding-top">') +
                    '<button class="button button-block button-dark button-outline" onclick="angular.element($(\'#tutorialDiv\')).scope().toggleGroupById(2);event.stopPropagation();">Hide</button>' +
                    ($rootScope.smallScreen ? '' : '</div></div>') +
                    '<h2 style="border-left:5px solid ' + settings.itemColor.event + '">Event attributes</h2>' +
                    '<p><strong>Title</strong> - A (short) identifier of the Event.</p>' +
                    '<p><strong>Description</strong> - Longer description of the Event.</p>' +
                    '<p><strong>Resource</strong> - Which Resource (in most cases which \'person\') is this Event for.</p>' +
                    '<p><strong>All-Day</strong> - Whether this Event consumes one or more entire days and does not start at a particular hour.</p>' +
                    '<p><strong>Start Date / Time</strong> - Marks the exact date &amp; time when this Event begins. Setting of Start may be constrained by dependencies - see the section on dependencies.</p>' +
                    '<p><strong>Duration</strong> - Duration (= how much time this Event takes to finish). Setting of Duration may be constrained by dependencies - see the section on dependencies.</p>' +
                    '<p><strong>Prerequisities / Dependent Tasks</strong> - See the section on dependencies.</p>'
                    )
            },
            {
                name: 'Edit existing Reminders / Events',
                id: 7,
                icon: 'ion-grid',
                content: $sce.trustAsHtml(

                    )
            },
            {
                name: 'Create an All-Day Event',
                id: 3,
                icon: 'ion-calendar',
                color: settings.itemColor.event,
                content: $sce.trustAsHtml(

                    )
            },
            {
                name: 'Create a Task',
                id: 4,
                icon: 'ion-compose',
                color: settings.itemColor.task,
                content: $sce.trustAsHtml(
                    '<h2 style="border-left:5px solid ' + settings.itemColor.task + '">Task</h2>' +
                    '<p class="bold">This type ("floating" Task) does NOT have a fixed start and end, but has a fixed due date. SCHEDULOGY schedules these Tasks so that these due dates (as well as dependencies - see later sections) are satisfied.</p>' +
                    '<p>SCHEDULOGY makes sure that there is only one concurrent Task in the calendar. There can be no Event concurrent with any Task either.</p>' +
                    '<p><strong>In order to create a new Task, select "New Task" from either the left menu (on large screen), or from the top menu (on small screen).</strong></p>' +
                    ($rootScope.smallScreen ? '' : '<div class="row"><div class="col-50 padding-horizontal padding-top">') +
                    ($rootScope.smallScreen ? '' : '<button class="button button-block button-dark" style="background-color:' + settings.itemColor.task + '" onclick="angular.element($(\'#tutorialDiv\')).scope().runTour(\'task\');event.stopPropagation();">Show me</button>') +
                    ($rootScope.smallScreen ? '' : '</div><div class="col-50 padding-horizontal padding-top">') +
                    '<button class="button button-block button-dark button-outline" onclick="angular.element($(\'#tutorialDiv\')).scope().toggleGroupById(4);event.stopPropagation();">Hide</button>' +
                    ($rootScope.smallScreen ? '' : '</div></div>') +
                    '<h2 style="border-left:5px solid ' + settings.itemColor.task + '">Task attributes</h2>' +
                    '<p><strong>Title</strong> - A (short) identifier of the Task.</p>' +
                    '<p><strong>Description</strong> - Longer description of the Task.</p>' +
                    '<p><strong>Admissible Resources</strong> - Which Resources (e.g. people) are able to perform this Task - which Resource can this Task be assigned to.</p>' +
                    '<p><strong>All-Day</strong> - Whether this Task consumes one or more entire days and will not be scheduled to start at a particular hour.</p>' +
                    '<p><strong>Start Date / Time</strong> - Marks the exact date &amp; time when this Task begins. Setting of Start may be constrained by dependencies - see the section on dependencies.</p>' +
                    '<p><strong>Due Date / Time</strong> - Only relevant for Tasks. Marks the exact date &amp; time when work on this Task has to be finished.</p>' +
                    '<p><strong>Duration</strong> - Duration (= how much time this Task takes to finish). Setting of Due may be constrained by dependencies - see the section on dependencies.</p>' +
                    '<p><strong>Prerequisities / Dependent Tasks</strong> - See the section on dependencies.</p>'
                    )
            },
            {
                name: 'Create a dependency #1',
                id: 5,
                icon: 'ion-arrow-swap'
            },
            {
                name: 'Create a dependency #2',
                id: 6,
                icon: 'ion-arrow-swap'
            }
        ];

        $scope.toggleGroup = function (group) {
            group.shown = !group.shown;
        };

        $scope.toggleGroupById = function (groupId) {
            var group = $scope.groups.find(function (group) {
                return group.id === groupId;
            });
            group.shown = !group.shown;
            Hopscotch.endTour();
            $scope.$apply();
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'tutorial')
                $scope.close();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['tutorial'].modal.remove();
        });
    });

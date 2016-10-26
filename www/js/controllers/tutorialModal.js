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
                id: 'reminder',
                content: $sce.trustAsHtml(
                    '<h2 style="border-left:5px solid ' + settings.itemColor.reminder + '">Reminder</h2>' +
                    '<p>A simple reminder, that keeps moving to the current day, until it is marked as done - at which point it stays at the day when it was marked as done.</p>' +
                    '<h2>Reminder attributes</h2>' +
                    '<p class="lowp"><strong>Title</strong> - A (short) identifier of the Reminder.</p>' +
                    '<p class="lowp"><strong>Description</strong> - Longer description of the Reminder.</p>' +
                    '<p class="lowp"><strong>Resource</strong> - Which Resource (in most cases which \'person\') is this Reminder for.</p>' +
                    '<p><strong>In order to create a new Reminder, select "New Reminder" from either the left menu (on large screen), or from the top menu (on small screen).</strong></p>' +
                    ($rootScope.smallScreen ? '' : '<div class="row"><div class="col-50 padding-horizontal padding-bottom">') +
                    ($rootScope.smallScreen ? '' : '<button class="button button-block button-dark" style="background-color:' + settings.itemColor.reminder + '" onclick="angular.element($(\'#tutorialDiv\')).scope().runTour(\'reminder\');event.stopPropagation();angular.element($(\'#tutorialDiv\')).scope().close();">Show me</button>') +
                    ($rootScope.smallScreen ? '' : '</div><div class="col-50 padding-horizontal padding-bottom">') +
                    '<button class="button button-block button-dark button-outline" onclick="angular.element($(\'#tutorialDiv\')).scope().toggleGroupById(\'reminder\');event.stopPropagation();">Hide</button>' +
                    ($rootScope.smallScreen ? '' : '</div></div>')
                    )
            },
            {
                name: 'Create an Event',
                id: 'event',
                icon: 'ion-calendar',
                color: settings.itemColor.event,
                content: $sce.trustAsHtml(
                    '<h2 style="border-left:5px solid ' + settings.itemColor.event + '">Event</h2>' +
                    '<p>Standard events, that have a fixed start (date &amp; time), and a fixed end (date &amp; time). The end is set up with help of Event duration.</p>' +
                    '<h2>Event attributes</h2>' +
                    '<p class="lowp"><strong>Title</strong> - A (short) identifier of the Event.</p>' +
                    '<p class="lowp"><strong>Description</strong> - Longer description of the Event.</p>' +
                    '<p class="lowp"><strong>Resource</strong> - Which Resource (in most cases which \'person\') is this Event for.</p>' +
                    '<p class="lowp"><strong>All-Day</strong> - Whether this Event consumes one or more entire days and does not start at a particular hour.</p>' +
                    '<p class="lowp"><strong>Start Date / Time</strong> - Marks the exact date &amp; time when this Event begins. Setting of Start may be constrained by dependencies - see the section on dependencies.</p>' +
                    '<p class="lowp"><strong>Duration</strong> - Duration (= how much time this Event takes to finish). Setting of Duration may be constrained by dependencies - see the section on dependencies.</p>' +
                    '<p class="lowp"><strong>Prerequisities / Dependent Tasks</strong> - See the section on dependencies.</p>' +
                    '<p><strong>In order to create a new Event, select "New Event" from either the left menu (on large screen), or from the top menu (on small screen).</strong></p>' +
                    ($rootScope.smallScreen ? '' : '<div class="row"><div class="col-50 padding-horizontal padding-bottom">') +
                    ($rootScope.smallScreen ? '' : '<button class="button button-block button-dark" style="background-color:' + settings.itemColor.event + '" onclick="angular.element($(\'#tutorialDiv\')).scope().runTour(\'event\');event.stopPropagation();angular.element($(\'#tutorialDiv\')).scope().close();">Show me</button>') +
                    ($rootScope.smallScreen ? '' : '</div><div class="col-50 padding-horizontal padding-bottom">') +
                    '<button class="button button-block button-dark button-outline" onclick="angular.element($(\'#tutorialDiv\')).scope().toggleGroupById(\'event\');event.stopPropagation();">Hide</button>' +
                    ($rootScope.smallScreen ? '' : '</div></div>')
                    )
            },
            {
                name: 'Edit Reminders / Events',
                id: 'edit',
                icon: 'ion-grid',
                content: $sce.trustAsHtml(
                    '<h2 style="border-left:5px solid black">Editing</h2>' +
                    '<p>In order to edit existing Reminders / Events / Tasks, just select them with mouse or touch in the calendar.</p>' +
                    '<p>It opens the same dialog as when you are creating an entry. A change is the added <strong>"Delete"</strong> button in the top-right corner.</p>' +
                    '<p><strong><i class="icon ion-alert" style="color:' + settings.itemColor.reminder + '"></i>&nbsp;&nbsp;Also</strong>, you can easily select an Event for direct editing by a <strong>long tap</strong>. After you select it, you can move it (by dragging it) &amp; change the duration (by dragging the top/bottom edge).</p>' +
                    '<p><strong><i class="icon ion-alert" style="color:' + settings.itemColor.reminder + '"></i>&nbsp;&nbsp;Additionally</strong>, clicking on any free <strong>future</strong> slot in the calendar, it opens the same dialog again, this time pre-filling it with the selection you made.</p>' +
                    ($rootScope.smallScreen ? '' : '<div class="row"><div class="col-50 padding-horizontal padding-bottom">') +
                    ($rootScope.smallScreen ? '' : '<button class="button button-block button-dark" onclick="angular.element($(\'#tutorialDiv\')).scope().runTour(\'edit\');event.stopPropagation();angular.element($(\'#tutorialDiv\')).scope().close();">Show me</button>') +
                    ($rootScope.smallScreen ? '' : '</div><div class="col-50 padding-horizontal padding-bottom">') +
                    '<button class="button button-block button-dark button-outline" onclick="angular.element($(\'#tutorialDiv\')).scope().toggleGroupById(\'edit\');event.stopPropagation();">Hide</button>' +
                    ($rootScope.smallScreen ? '' : '</div></div>')
                    )
            },
            {
                name: 'Create an All-Day Event',
                id: 'allday',
                icon: 'ion-calendar',
                content: $sce.trustAsHtml(
                    '<h2 style="border-left:5px solid black">All-Day entries</h2>' +
                    '<p>The All-Day entries (Events, Tasks) are identified by the attribute <strong>All-Day</strong> - this switch controls whether an Event / a Task takes entire day(s) instead of a number of slots (hours).</p>' +
                    '<p>The same approach that applies to <strong>Events</strong> also applies to <strong>Tasks</strong>.</p>' +
                    '<p>In order to create an All-Day Event, we need to create an Event and use the All-Day switch in the dialog.</p>' +
                    ($rootScope.smallScreen ? '' : '<div class="row"><div class="col-50 padding-horizontal padding-bottom">') +
                    ($rootScope.smallScreen ? '' : '<button class="button button-block button-dark" onclick="angular.element($(\'#tutorialDiv\')).scope().runTour(\'allDay\');event.stopPropagation();angular.element($(\'#tutorialDiv\')).scope().close();">Show me</button>') +
                    ($rootScope.smallScreen ? '' : '</div><div class="col-50 padding-horizontal padding-bottom">') +
                    '<button class="button button-block button-dark button-outline" onclick="angular.element($(\'#tutorialDiv\')).scope().toggleGroupById(\'allDay\');event.stopPropagation();">Hide</button>' +
                    ($rootScope.smallScreen ? '' : '</div></div>')
                )
            },
            {
                name: 'Create a Task',
                id: 'task',
                icon: 'ion-compose',
                color: settings.itemColor.task,
                content: $sce.trustAsHtml(
                    '<h2 style="border-left:5px solid ' + settings.itemColor.task + '">Task</h2>' +
                    '<p>This type ("floating" Task) does NOT have a fixed start and end, but has a fixed due date. SCHEDULOGY schedules these Tasks so that these due dates (as well as dependencies - see later sections) are satisfied.</p>' +
                    '<p>SCHEDULOGY makes sure that there is only one concurrent Task in the calendar. There can be no Event concurrent with any Task either.</p>' +
                    '<h2>Task attributes</h2>' +
                    '<p class="lowp"><strong>Title</strong> - A (short) identifier of the Task.</p>' +
                    '<p class="lowp"><strong>Description</strong> - Longer description of the Task.</p>' +
                    '<p class="lowp"><strong>Admissible Resources</strong> - Which Resources (e.g. people) are able to perform this Task - which Resource can this Task be assigned to.</p>' +
                    '<p class="lowp"><strong>All-Day</strong> - Whether this Task consumes one or more entire days and will not be scheduled to start at a particular hour.</p>' +
                    '<p class="lowp"><strong>Start Date / Time</strong> - Marks the exact date &amp; time when this Task begins. Setting of Start may be constrained by dependencies - see the section on dependencies.</p>' +
                    '<p class="lowp"><strong>Due Date / Time</strong> - Only relevant for Tasks. Marks the exact date &amp; time when work on this Task has to be finished.</p>' +
                    '<p class="lowp"><strong>Duration</strong> - Duration (= how much time this Task takes to finish). Setting of Due may be constrained by dependencies - see the section on dependencies.</p>' +
                    '<p class="lowp"><strong>Prerequisities / Dependent Tasks</strong> - See the section on dependencies.</p>' +
                    '<p><strong>In order to create a new Task, select "New Task" from either the left menu (on large screen), or from the top menu (on small screen).</strong></p>' +
                    ($rootScope.smallScreen ? '' : '<div class="row"><div class="col-50 padding-horizontal padding-bottom">') +
                    ($rootScope.smallScreen ? '' : '<button class="button button-block button-dark" style="background-color:' + settings.itemColor.task + '" onclick="angular.element($(\'#tutorialDiv\')).scope().runTour(\'task\');event.stopPropagation();angular.element($(\'#tutorialDiv\')).scope().close();">Show me</button>') +
                    ($rootScope.smallScreen ? '' : '</div><div class="col-50 padding-horizontal padding-bottom">') +
                    '<button class="button button-block button-dark button-outline" onclick="angular.element($(\'#tutorialDiv\')).scope().toggleGroupById(\'task\');event.stopPropagation();">Hide</button>' +
                    ($rootScope.smallScreen ? '' : '</div></div>')
                    )
            },
            {
                name: 'Dependency #1 - Task depending on an Event',
                id: 'depOnEvent',
                icon: 'ion-arrow-swap',
                content: $sce.trustAsHtml(
                    '<h2>Task depending on an Event</h2>' +
                    '<p>Tasks can depend on an Event, which captures the use case of some work needed to be done, but only after some Event (meeting, planning, presentation, etc.) has taken place.</p>' +
                    '<p>Only Tasks can depend on either an Event or a Task (see next tutorial), Events do not depend on anything as they have a fixed start and end.</p>' +
                    '<p>SCHEDULOGY makes sure that the Task is scheduled to be worked on only after the Event has taken place.</p>' +
                    '<p><strong>In order to create such a dependency, we first need to create an Event, and then a Task where we specify the Event as a prerequisity.</p>' +
                    ($rootScope.smallScreen ? '' : '<div class="row"><div class="col-50 padding-horizontal padding-bottom">') +
                    ($rootScope.smallScreen ? '' : '<button class="button button-block button-dark" onclick="angular.element($(\'#tutorialDiv\')).scope().runTour(\'depOnEvent\');event.stopPropagation();angular.element($(\'#tutorialDiv\')).scope().close();">Show me</button>') +
                    ($rootScope.smallScreen ? '' : '</div><div class="col-50 padding-horizontal padding-bottom">') +
                    '<button class="button button-block button-dark button-outline" onclick="angular.element($(\'#tutorialDiv\')).scope().toggleGroupById(\'depOnEvent\');event.stopPropagation();">Hide</button>' +
                    ($rootScope.smallScreen ? '' : '</div></div>')
                    )
            },
            {
                name: 'Dependency #2 - Task blocking another Task',
                id: 'depOnTask',
                icon: 'ion-arrow-swap',
                content: $sce.trustAsHtml(
                    '<h2>Task blocking another Task</h2>' +
                    '<p>Tasks, like Events can block other Tasks. That is only natural and occurs every day, now with SCHEDULOGY you can model this very easily.</p>' +
                    '<p><strong>In order to create such a dependency, we need to create one Task (no matter which comes first - the prerequisite, or the dependent one), and then we link them using the dependency linking.</p>' +
                    ($rootScope.smallScreen ? '' : '<div class="row"><div class="col-50 padding-horizontal padding-bottom">') +
                    ($rootScope.smallScreen ? '' : '<button class="button button-block button-dark" onclick="angular.element($(\'#tutorialDiv\')).scope().runTour(\'depOnTask\');event.stopPropagation();angular.element($(\'#tutorialDiv\')).scope().close();">Show me</button>') +
                    ($rootScope.smallScreen ? '' : '</div><div class="col-50 padding-horizontal padding-bottom">') +
                    '<button class="button button-block button-dark button-outline" onclick="angular.element($(\'#tutorialDiv\')).scope().toggleGroupById(\'depOnTask\');event.stopPropagation();">Hide</button>' +
                    ($rootScope.smallScreen ? '' : '</div></div>')
                    )
            },
            {
                name: 'Setup SCHEDULOGY Resources',
                id: 'resources',
                icon: 'ion-levels',
                content: $sce.trustAsHtml(
                    '<h2>Resources</h2>' +
                    '<p>Resources represent any entity (e.g. people) capable of performing Tasks</p>' +
                    '<p>For an <strong>Event</strong>, the attribute <strong>"Resource"</strong> specifies which Resource (in most cases which \'person\') is this Event for.</p>' +
                    '<p>For a <strong>Task</strong>, the attribute <strong>"Admissible Resources"</strong> specifies which Resources (e.g. people) are able to perform this Task - which Resource can this Task be assigned to.</p>' +
                    '<p>To setup the Resource(s) that you have, select "Manage Resources" in the left menu.</p>' +
                    ($rootScope.smallScreen ? '' : '<div class="row"><div class="col-50 padding-horizontal padding-bottom">') +
                    ($rootScope.smallScreen ? '' : '<button class="button button-block button-dark" onclick="angular.element($(\'#tutorialDiv\')).scope().runTour(\'resources\');event.stopPropagation();angular.element($(\'#tutorialDiv\')).scope().close();">Show me</button>') +
                    ($rootScope.smallScreen ? '' : '</div><div class="col-50 padding-horizontal padding-bottom">') +
                    '<button class="button button-block button-dark button-outline" onclick="angular.element($(\'#tutorialDiv\')).scope().toggleGroupById(\'resources\');event.stopPropagation();">Hide</button>' +
                    ($rootScope.smallScreen ? '' : '</div></div>')
                    )
                
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

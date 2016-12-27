angular.module('Schedulogy')
    .controller('HelpModalCtrl', function ($scope, constants, $sce, ModalService) {
        $scope.open = function () {
            ModalService.openModalInternal('help');
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('help', $scope, $scope.open, $scope.close);

        $scope.groups = [
            {
                name: 'Introduction',
                shown: true,
                icon: 'ion-home',
                content:
                    '<h2>SCHEDULOGY Help pages</h2>' +
                    '<p>The following sections should explain the basic principles of using SCHEDULOGY. If, however, something remains unclear, or you have any feedback regarding the functionality, please contact us.</p>' +
                    '<a class="center" href="mailto:info@schedulogy.com">info@schedulogy.com</a>'

            },
            {
                name: 'Calendar usage',
                icon: 'ion-calendar',
                content: $sce.trustAsHtml(
                    '<p>The main advantage of SCHEDULOGY over usual tools is employing planning &amp; scheduling algorithms to optimize your calendar for you.</p>' +
                    '<p>This is done using the "Task" objects (see "Entry types" section).</p>' +
                    '<p>SCHEDULOGY aims to be the most efficient and smooth task &amp; time management tool there is.</p>' +
                    '<p>We are working hard to achieve that goal. The basic functionality is there, and a lot more is coming.</p>' + 
                    '<p>Some of the coming features that you can look forward to are:</p>' + 
                    '<ul style="margin-left:20px;list-style:square;">' +
                    '<li>Social logings<ul><li>Log in through using your Google, Facebook, or Twitter account.</li></ul></li>' +
                    '<li>Long-term projects<ul><li>Add a project without a due date, that will fill your free time slots - maybe you want to start a side business, maybe you just want to get in shape in the gym, all such things can be entered as projects.</li></ul></li>' +
                    '<li>Search bars<ul><li>Not sure when exactly is a meeting occuring, or what is the name of a prerequisite task? Search bars will help you finding what you need.</li></ul></li>' +
                    '<li>Device notifications<ul><li>Sometimes an e-mail notification is not enough. We will add device notifications for your cellphones, tablets, etc..</li></ul></li>' +
                    '<li>Fluid UX<ul><li>Right now you can swipe to navigate within views, but in steps (not continuously), also you cannot zoom, both these will be added.</li></ul></li>' +
                    '<li>Multi-resource Events / Tasks<ul><li>Some Events / Tasks must be done by multiple people, or other resources at the same time, support for this will be added.</li></ul></li>' +
                    '</ul>'
                    )
            },
            {
                name: 'Entry types',
                icon: 'ion-paper-airplane',
                content: $sce.trustAsHtml(
                    '<h2 style="border-left:5px solid ' + constants.itemColor('event', false) + '">Event</h2>' +
                    '<p>Standard events, that have a fixed start (date &amp; time), and a fixed end (date &amp; time). The end is set up with help of event duration.</p>' +
                    '<p>All events can be concurrently in the calendar. There is no limit on the number of concurrent events.</p>' +
                    '<h2 style="border-left:5px solid ' + constants.itemColor('task', false) + '">Task</h2>' +
                    '<p class="bold">This type ("floating" Task) does NOT have a fixed start and end, but has a fixed due date. SCHEDULOGY schedules these Tasks so that these due dates (as well as dependencies - see later sections) are satisfied.</p>' +
                    '<p>SCHEDULOGY makes sure that there is only one concurrent Task in the calendar. There can be no Event concurrent with any Task either.</p>' + 
                    '<h2 style="border-left:5px solid ' + constants.itemColor('reminder', false) + '">Reminder</h2>' +
                    '<p>A simple reminder, that keeps moving to the current day, until it is marked as done - at which point it stays at the day when it was marked as done.</p>' +
                    '<h2 style="border-left:5px solid ' + constants.itemColor('event', true) + '">All-Day Events / Tasks</h2>' +
                    '<p>Convenience types, similar to Events &amp; Tasks, that do not start, end, or are due at a specific hour. Instead their start, end &amp; due date attributes, as well as duration contain dates only and the entries consume entire day.</p>'
                    )
            },
            {
                name: 'Entry attributes',
                icon: 'ion-clipboard',
                content:
                    '<h2>Title</h2><p>A (short) identifier of the entry.</p>' +
                    '<h2>Description</h2><p>Longer description of the entry.</p>' +
                    '<h2>Resource</h2><p>Only relevant for Events / Reminders. Which Resource (e.g. person) is this Event / Reminder for.</p>' +
                    '<h2>Admissible Resources</h2><p>Only relevant for Tasks. Which Resources (e.g. people) are able to perform this Task - which Resource can this Task be assigned to.</p>' +
                    '<h2>All-Day</h2><p>Whether this entry consumes one or more entire daysand does not start at a particular hour. See entry types section for explanation.</p>' +
                    '<h2>Start Date / Time</h2><p>Only relevant for Events. Marks the exact date &amp; time when this Event begins. Setting of Start may be constrained by dependencies - see the section on dependencies.</p>' +
                    '<h2>Due Date / Time</h2><p>Only relevant for Tasks. Marks the exact date &amp; time when work on this Task has to be finished.</p>' +
                    '<h2>Duration</h2><p>Duration (= how much time this Task / Event takes to finish). Setting of Duration may be constrained by dependencies - see the section on dependencies.</p>' +
                    '<h2>Prerequisities / Dependent Tasks</h2><p>See the section on dependencies.</p>'
            },
            {
                name: 'Resources',
                icon: 'ion-levels',
                content:
                    '<h2>Resource</h2><p>Only relevant for Events / Reminders. Which Resource (e.g. person) is this Event / Reminder for.</p>' +
                    '<p>A Resource is an individual person / a group of people / any other entity to which we can assign Tasks / Events / Reminders.</p>' +
                    '<p>One Resource which is created by default represents you (your user, yourself). This will be the default Resource to which all entries in the calendar are assigned.</p>' +
                    '<p>In regular calendar apps, a Resource has a rough equivalent as a "calendar". Usually you may also put items in a calendar app to more than one "calendars".</p>'
            },
            {
                name: 'Entry notifications',
                icon: 'ion-paper-airplane',
                content:
                    '<p>SCHEDULOGY automatically sends out notifications about upcoming Events / Tasks.</p>' + 
                    '<p>Right now, these are preset at <strong>0 &amp; 15 minutes</strong> before a regular Event / Task, <strong>1 day</strong> before an All-Day Event / Task.</p>' + 
                    '<p>Notification with all not-done Reminders is sent at UTC midnight.</p>'
            },
            {
                name: 'Task dependencies',
                icon: 'ion-link',
                content:
                    '<p>Tasks in SCHEDULOGY may depend on one another. Task A being dependent on Task B means that any work on Task A may be started only as soon as all work on Task B is finished.</p>' +
                    '<p>Tasks can be also dependent on Events, but Events as they have fixed start, cannot depend on anything.</p>' +
                    '<h2>Notation</h2>' +
                    '<h3>Prerequisite</h3><p>A Task A having a Task B as a prerequisite means that Task A depends on B.</p>' +
                    '<h3>Dependent Task</h3><p>A Task A having a Task B as a dependent Task means that Task B depends on A.</p>' +
                    '<h2>Limitation</h2><p>Only Tasks can have prerequisites. But both fixed and Tasks can have dependent Tasks.</p>' +
                    '<h2>Constraints</h2><p>One can only select prerequisites / dependent Tasks that comply with due date / time (in the case of a Task), or start date / time (in the case of an Event).</p>' +
                    '<p>On the other hand, updating both (in the case of a Task) and start date / time (in the case of an Event) is constrained by the current dependencies.</p>'
            },
            {
                name: 'Upload from iCal file',
                icon: 'ion-upload',
                content:
                    '<p>This feature enables you to upload an iCal file for example from your Outlook, Google Calendar, or any other calendar application capable of exporting to iCal format.</p>' +
                    '<p>All items in your calendar are imported as Events.</p>' +
                    '<p>Recurring events are supported.</p>'
            },
            {
                name: 'Keyboard shortcuts',
                icon: 'ion-android-laptop',
                content:
                    '<h3>Left, right arrows</h3><p>Navigate in the view left and right by a small unit (e.g. Day / Week).</p>' +
                    '<h3>Ctrl + left, right arrows</h3><p>Navigate in the view left and right by a large unit (e.g. Week / Month).</p>' +
                    '<h3>t, T</h3><p>Opens the "New Task" dialog.</p>' +
                    '<h3>e, E</h3><p>Opens the "New Event" dialog.</p>' +
                    '<h3>r, R</h3><p>Opens the "New Resource" dialog.</p>' +
                    '<h3>h, H</h3><p>Opens this Help.</p>'
            }
        ];

        $scope.toggleGroup = function (group) {
            group.shown = !group.shown;
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'help')
                $scope.close();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['help'].modal.remove();
        });
    });

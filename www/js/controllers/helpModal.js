angular.module('Schedulogy')
    .controller('HelpModalCtrl', function ($scope, settings, $sce, ModalService) {
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
                    '<p>This is done using the task type "floating" (see "Task types" section).</p>' +
                    '<p>SCHEDULOGY aims to be the most efficient and smooth task &amp; time management tool there is.</p>' +
                    '<p>We are working hard to achieve that goal. For the time being, however, there are some limitations that you should be aware of.</p>' +
                    '<p>First - although fixed tasks may be scheduled to any time, any day, only working week is displayed, 8:00 to 17:00, which is exactly where floating tasks are automatically scheduled.</p>'
                    )
            },
            {
                name: 'Task types',
                icon: 'ion-paper-airplane',
                content: $sce.trustAsHtml(
                    '<h2 style="border-left:5px solid ' + settings.eventColor.fixed + '">Fixed</h2>' +
                    '<p>Standard tasks, that have a fixed start (date &amp; time), and a fixed end (date &amp; time). The end is set up with help of task duration.</p>' +
                    '<h2 style="border-left:5px solid ' + settings.eventColor.fixedAllDay + '">Fixed (all-day)</h2>' +
                    '<p>Convenience type, similar to fixed tasks, with start, end and duration containing date part only (no specific time).</p>' +
                    '<p>All fixed tasks can be concurrently in the calendar. There is no limit on the number of concurrent fixed tasks.</p>' +
                    '<h2 style="border-left:5px solid ' + settings.eventColor.floating + '">Floating</h2>' +
                    '<p class="bold">This task type does NOT have a fixed start and end, but has a fixed due date. SCHEDULOGY schedules these tasks so that these due dates (as well as dependencies - see later sections) are satisfied.</p>' +
                    '<p>SCHEDULOGY makes sure that there is only one concurrent floating task in the calendar. There can be no fixed task concurrent with any floating task either.</p>'
                    )
            },
            {
                name: 'Task attributes',
                icon: 'ion-clipboard',
                content:
                    '<h2>Type</h2><p>See the section on task types.</p>' +
                    '<h2>Title</h2><p>A (short) identifier of the task.</p>' +
                    '<h2>Description</h2><p>Longer description of the task.</p>' +
                    '<h2>Start Date / Time</h2><p>Only relevant for fixed tasks. Marks the exact date &amp; time when work on this task begins. Setting of Start may be constrained by dependencies - see the section on task dependencies</p>' +
                    '<h2>Due Date / Time</h2><p>Only relevant for floating tasks. Marks the exact date &amp; time when work on this task has to be finished.</p>' +
                    '<h2>Duration</h2><p>Duration (= how much time this task takes to finish). Setting of Due may be constrained by dependencies - see the section on task dependencies</p>' +
                    '<h2>Prerequisites / Dependent Tasks</h2><p>See the section on task dependencies.</p>'
            },
            {
                name: 'Task notifications',
                icon: 'ion-paper-airplane',
                content:
                    '<p>SCHEDULOGY automatically sends out notifications about upcoming tasks. Right now, these are preset at <strong>15 minutes</strong> before a regular task, <strong>1 day</strong> before an all-day task.</p>'
            },
            {
                name: 'Task dependencies',
                icon: 'ion-link',
                content:
                    '<p>Tasks in SCHEDULOGY may depend on one another. A task A being dependent on task B means that any work on task A may be started only as soon as all work on task B is finished.</p>' +
                    '<h2>Notation</h2>' +
                    '<h3>Prerequisite</h3><p>A task A having a task B as a prerequisite means that task A depends on B.</p>' +
                    '<h3>Dependent Task</h3><p>A task A having a task B as a dependent task means that task B depends on A.</p>' +
                    '<h2>Limitation</h2><p>Only floating tasks can have prerequisites. But both fixed and floating tasks can have dependent tasks.</p>' +
                    '<h2>Constraints</h2><p>One can only select prerequisites / dependent tasks that comply with due date / time (in the case of a floating task), or start date / time (in the case of a fixed task).</p>' +
                    '<p>On the other hand, updating both (in the case of a floating task) and start date / time (in the case of a fixed task) is constrained by the current dependencies.</p>'
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

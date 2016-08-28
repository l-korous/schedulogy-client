angular.module('Schedulogy')
    .service('Hopscotch', function ($timeout) {
        var _this = this;
        this.tour = {
            id: "Introduction",
            steps: [
                {
                    title: "Menu",
                    content: "Let's start with opening the menu.",
                    target: "menuOpener",
                    placement: "bottom",
                    arrowOffset: -1,
                    nextOnTargetClick: true,
                    showNextButton: false
                },
                {
                    title: "New Task",
                    content: "Let's go create a task.",
                    target: "newtask",
                    yOffset: -10,
                    placement: "right",
                    nextOnTargetClick: true,
                    showNextButton: false
                },
                {
                    title: "Task type",
                    content: "Here is where you can select task type. Select 'Fixed' now.",
                    target: "tasktypeselector",
                    delay: 500,
                    placement: "bottom"
                },
                {
                    title: "Task title",
                    content: "Insert a title.",
                    target: "primaryInput",
                    placement: "bottom"
                },
                {
                    title: "Task start date",
                    content: "Let us leave this as it is now. Note that the time selected by default is the next 'slot'.",
                    target: "fixedStartDate",
                    placement: "bottom"
                },
                {
                    title: "Task start time",
                    content: "Let us leave this as it is now. Note that the time selected by default is the next 'slot'.",
                    target: "fixedStartTime",
                    placement: "bottom"
                },
                {
                    title: "Task duration",
                    content: "Let us leave this as it is now. Later, you can create a task with any duration by selecting slots directly in the calendar.",
                    target: "fixedDuration",
                    placement: "bottom"
                },
                {
                    title: "Save the task",
                    target: "taskSave",
                    placement: "top",
                    nextOnTargetClick: true,
                    showNextButton: false
                },
                {
                    title: "Move to next day/week/month",
                    target: "button-customId-next",
                    placement: "left",
                    yOffset: -17,
                    nextOnTargetClick: true,
                    showNextButton: false
                },
                {
                    title: "Create a task by dragging",
                    content: "Select several 'slots' in the calendar by dragging. This will open a New Task dialog",
                    target: "fc-time-grid-container",
                    placement: "top"
                },
                {
                    title: "Task type",
                    content: "Let us give floating tasks a go - select 'Floating'",
                    target: "tasktypeselector",
                    placement: "bottom"
                },
                {
                    title: "Task title",
                    content: "Insert a title.",
                    target: "primaryInput",
                    placement: "bottom"
                },
                {
                    title: "Task due date",
                    content: "This is the date (later we will set the time) when the task needs to be completed. Let us leave this as it is now",
                    target: "floatingDueDate",
                    placement: "bottom"
                },
                {
                    title: "Task due time",
                    content: "Let us leave this as it is now. It is the exact time when this task needs to be completed.",
                    target: "floatingDueTime",
                    placement: "bottom"
                },
                {
                    title: "Task duration",
                    content: "Let us leave this as it is now. You can see that by default, duration equals to the length of your calendar selection.",
                    target: "floatingDuration",
                    placement: "bottom"
                },
                {
                    title: "Save the task",
                    target: "taskSave",
                    placement: "top",
                    nextOnTargetClick: true,
                    showNextButton: false
                },
                {
                    title: "Success",
                    delay: 500,
                    content: "The scheduling backend now successfully scheduled your task.",
                    target: "fc-time-grid-container",
                    placement: "top"
                },
                {
                    title: "Menu",
                    content: "Let's go back to the menu.",
                    target: "menuOpener",
                    placement: "bottom",
                    arrowOffset: -1,
                    nextOnTargetClick: true,
                    showNextButton: false
                },
                {
                    title: "More help",
                    content: "There are more help articles explaining the workings of SCHEDULOGY available under this link.",
                    target: "helplink",
                    yOffset: -10,
                    placement: "right"
                }
            ],
            onError: function () {
                console.log('damn');
            }
        };

        this.runTour = function (timeout) {
            $timeout(function () {
                hopscotch.startTour(_this.tour, 0);
            }, timeout);
        };
    });
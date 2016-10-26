angular.module('Schedulogy')
    .service('Hopscotch', function ($timeout, ModalService, settings, $sce, MyItems) {
        var _this = this;
        this.tours = {
            reminder: {
                id: "reminder",
                steps: [
                    {
                        title: "New Reminder",
                        content: "This button here pops up the 'New Reminder' modal window. Please click it.",
                        target: "newreminder",
                        yOffset: -10,
                        placement: "right",
                        nextOnTargetClick: true,
                        showNextButton: false
                    },
                    {
                        title: "Title",
                        content: "Insert a title, e.g. \"Book a hotel in Paris for the weekend\". Click on \"Next\" afterwards.",
                        target: "reminderPrimaryInput",
                        xOffset: 10,
                        placement: "bottom",
                        delay: 500,
                        onNext: function () {
                            $('#reminderModalTextarea').focus();
                        }
                    },
                    {
                        title: "Description",
                        content: "Insert a description, e.g. \"Near Rue des Barres if possible\". Click on \"Next\" afterwards.",
                        target: "reminderModalTextarea",
                        xOffset: 10,
                        placement: "bottom",
                        delay: 300
                    },
                    {
                        title: "Save",
                        content: "Click on \"Save\" to save the Reminder.",
                        target: "reminderSave",
                        nextOnTargetClick: true,
                        placement: "top",
                        xOffset: 10,
                        delay: 300
                    },
                    {
                        title: "Finish",
                        width: 200,
                        content: "You see the Reminder you just created in the calendar. Click on \"Done\" to get back to Tutorial.",
                        target: "theOnlyCalendar",
                        placement: "left",
                        xOffset: 150,
                        yOffset: 100,
                        delay: 500
                    }
                ],
                onEnd: function () {
                    ModalService.closeModal();
                    ModalService.openModal('tutorial');
                }
            },
            event: {
                id: "event",
                steps: [
                    {
                        title: "New Event",
                        content: "This button here pops up the 'New Event' modal window. Please click it.",
                        target: "newevent",
                        yOffset: -10,
                        placement: "right",
                        nextOnTargetClick: true,
                        showNextButton: false
                    },
                    {
                        title: "Title",
                        content: "Insert a title, e.g. \"Product Team Meeting\". Click on \"Next\" afterwards.",
                        target: "eventPrimaryInput",
                        placement: "bottom",
                        xOffset: 10,
                        delay: 500,
                        onNext: function () {
                            $('#eventModalTextarea').focus();
                        }
                    },
                    {
                        title: "Description",
                        content: "Insert a description, e.g. \"Agenda will be provided later.\". Click on \"Next\" afterwards.",
                        target: "eventModalTextarea",
                        xOffset: 10,
                        placement: "bottom",
                        delay: 300
                    },
                    {
                        title: "Start date",
                        content: "Select the start date. You can leave the default selection - 24 hours in future.",
                        target: "eventStartDate",
                        placement: "bottom"
                    },
                    {
                        title: "Start time",
                        content: "Select the start time. You can leave the default selection - 24 hours in future.",
                        target: "eventStartTime",
                        placement: "bottom"
                    },
                    {
                        title: "Duration",
                        content: "Select the duration. You can leave the default selection - " + parseInt(settings.defaultTaskDuration[0] * settings.minuteGranularity) + " minutes.",
                        target: "eventDuration",
                        placement: "bottom"
                    },
                    {
                        title: "Save",
                        content: "Click on \"Save\".",
                        target: "eventSave",
                        nextOnTargetClick: true,
                        showNextButton: false,
                        placement: "top",
                        xOffset: 10,
                        delay: 300
                    },
                    {
                        title: "Finish",
                        width: 200,
                        content: "You see the Event you just created in the calendar. Click on \"Done\" to get back to Tutorial.",
                        target: "theOnlyCalendar",
                        placement: "left",
                        xOffset: 150,
                        yOffset: 100,
                        delay: 500
                    }
                ],
                onEnd: function () {
                    ModalService.closeModal();
                    ModalService.openModal('tutorial');
                }
            },
            allDay: {
                id: "allDay",
                steps: [
                    {
                        title: "New Event",
                        content: "This button here pops up the 'New Event' modal window. Please click it.",
                        target: "newevent",
                        yOffset: -10,
                        placement: "right",
                        nextOnTargetClick: true,
                        showNextButton: false
                    },
                    {
                        title: "All-Day switch",
                        content: "Please click the switch on the right for this Event to be an All-Day Event. Note that the Start time attribute disappears.",
                        target: "eventAllDay",
                        xOffset: 10,
                        placement: "bottom",
                        nextOnTargetClick: true,
                        showNextButton: false,
                        delay: 500,
                        onNext: function () {
                            $('#eventPrimaryInput').focus();
                        }
                    },
                    {
                        title: "Title",
                        content: "Insert a title, e.g. \"Work from home\". Click on \"Next\" afterwards.",
                        target: "eventPrimaryInput",
                        xOffset: 10,
                        placement: "bottom",
                        delay: 500
                    },
                    {
                        title: "Start date",
                        content: "Select the start date.",
                        target: "eventStartDate",
                        placement: "bottom"
                    },
                    {
                        title: "Duration",
                        content: "Select the duration. You can leave the default selection - " + parseInt(settings.defaultTaskDuration[1]) + " days.",
                        target: "eventDuration",
                        placement: "bottom"
                    },
                    {
                        title: "Save",
                        content: "Click on \"Save\".",
                        target: "eventSave",
                        nextOnTargetClick: true,
                        xOffset: 10,
                        showNextButton: false,
                        placement: "top",
                        delay: 300
                    },
                    {
                        title: "Finish",
                        width: 200,
                        content: "You see the Event you just created in the calendar. Click on \"Done\" to get back to Tutorial.",
                        target: "theOnlyCalendar",
                        placement: "left",
                        xOffset: 150,
                        yOffset: 100,
                        delay: 500
                    }
                ],
                onEnd: function () {
                    ModalService.closeModal();
                    ModalService.openModal('tutorial');
                }
            },
            task: {
                id: "task",
                steps: [
                    {
                        title: "New Task",
                        content: "This button here pops up the 'New Task' modal window. Please click it.",
                        target: "newtask",
                        yOffset: -10,
                        placement: "right",
                        nextOnTargetClick: true,
                        showNextButton: false
                    },
                    {
                        title: "Title",
                        content: "Insert a title, e.g. \"Prepare the roadmap for the Alpha Project\". Click on \"Next\" afterwards.",
                        target: "taskPrimaryInput",
                        xOffset: 10,
                        placement: "bottom",
                        delay: 500,
                        onNext: function () {
                            $('#taskModalTextarea').focus();
                        }
                    },
                    {
                        title: "Description",
                        content: "Insert a description, e.g. \"Use the data collected the stakeholders.\". Click on \"Next\" afterwards.",
                        target: "taskModalTextarea",
                        placement: "bottom",
                        xOffset: 10,
                        delay: 300
                    },
                    {
                        title: "Due date",
                        content: "Select the due date. For this tutorial leave the default selection - 24 hours in future.",
                        target: "dueDate",
                        placement: "bottom"
                    },
                    {
                        title: "Due time",
                        content: "Select the due time. For this tutorial leave the default selection - 24 hours in future.",
                        target: "dueTime",
                        placement: "bottom"
                    },
                    {
                        title: "Duration",
                        content: "Select the duration. You can leave the default selection - " + parseInt(settings.defaultTaskDuration[0] * settings.minuteGranularity) + " minutes.",
                        target: "taskDuration",
                        placement: "bottom"
                    },
                    {
                        title: "Save",
                        content: "Click on \"Save\".",
                        target: "taskSave",
                        nextOnTargetClick: true,
                        showNextButton: false,
                        xOffset: 10,
                        placement: "top",
                        delay: 300
                    },
                    {
                        title: "Finish",
                        width: 200,
                        content: "You see the Task you just created in the calendar. Click on \"Done\" to get back to Tutorial.",
                        target: "theOnlyCalendar",
                        placement: "left",
                        xOffset: 150,
                        yOffset: 100,
                        delay: 500
                    }
                ],
                onEnd: function () {
                    ModalService.closeModal();
                    ModalService.openModal('tutorial');
                }
            },
            edit: {
                id: "edit",
                onStart: function () {
                    $('#theOnlyCalendar').fullCalendar('changeView', 'agenda3Day');
                    $('#theOnlyCalendar').fullCalendar('updateNowIndicator');
                },
                steps: [
                    {
                        title: "Edit / Select",
                        content: "You can edit existing entries in the calendar and directly create Events by selecting required slots. Click on \"Next\".",
                        target: "theOnlyCalendar",
                        xOffset: 200,
                        yOffset: 200,
                        width: 300,
                        placement: "left"
                    },
                    {
                        title: "Edit / Select",
                        content: $sce.trustAsHtml("Now try:<br />1 - selecting free slots in the calendar (opens \"New Event\" dialog),<br />2 - selecting existing items with a short tap (opens item's detail),<br />3 - selecting existing items with a long tap (lets you move and resize the item)."),
                        xOffset: 250,
                        yOffset: 200,
                        width: 400,
                        target: "theOnlyCalendar",
                        placement: "left",
                        delay: 200
                    }
                ],
                onEnd: function () {
                    ModalService.closeModal();
                    ModalService.openModal('tutorial');
                }
            },
            depOnEvent: {
                id: "depOnEvent",
                steps: [
                    {
                        title: "New Event",
                        content: "This button here pops up the 'New Event' modal window. Please click it.",
                        target: "newevent",
                        yOffset: -10,
                        placement: "right",
                        nextOnTargetClick: true,
                        showNextButton: false
                    },
                    {
                        title: "Title",
                        content: "Insert a title, e.g. \"Management meeting\". Click on \"Next\" afterwards.",
                        target: "eventPrimaryInput",
                        placement: "bottom",
                        xOffset: 10,
                        delay: 500,
                        onNext: function () {
                            $('#eventModalTextarea').focus();
                        }
                    },
                    {
                        title: "Description",
                        content: "Insert a description, e.g. \"Constraints for the roadmap will be presented.\". Click on \"Next\" afterwards.",
                        target: "eventModalTextarea",
                        xOffset: 10,
                        placement: "bottom",
                        delay: 300
                    },
                    {
                        title: "Save",
                        content: "Let us leave the rest. Click on \"Save\".",
                        target: "eventSave",
                        nextOnTargetClick: true,
                        showNextButton: false,
                        placement: "top",
                        delay: 300
                    },
                    {
                        title: "New Task",
                        content: "Now let us go create the Task.",
                        target: "newtask",
                        delay: 800,
                        yOffset: -10,
                        placement: "right",
                        nextOnTargetClick: true,
                        showNextButton: false
                    },
                    {
                        title: "Title",
                        content: "Insert a title, e.g. \"Work on the roadmap\". Click on \"Next\" afterwards.",
                        target: "taskPrimaryInput",
                        xOffset: 10,
                        placement: "bottom",
                        delay: 500
                    },
                    {
                        title: "Due date",
                        content: "We have to select the due date. Select 3 days from now - " + MyItems.getBTime().clone().add(3, 'd').format(settings.dateFormatLong) + ".",
                        target: "dueDate",
                        placement: "bottom"
                    },
                    {
                        title: "Due time",
                        content: "We have to select the due time. Select any time 3 days from now - " + MyItems.getBTime().clone().add(3, 'd').format(settings.dateFormatLong) + ".",
                        target: "dueTime",
                        placement: "bottom"
                    },
                    {
                        title: "Dependency",
                        content: "Now we will mark the Event we had created as a prerequisite. Select it from the drop-down.",
                        target: "taskPrerequisites",
                        xOffset: 10,
                        placement: "top"
                    },
                    {
                        title: "Save",
                        content: "Click on \"Save\".",
                        target: "taskSave",
                        nextOnTargetClick: true,
                        xOffset: 10,
                        showNextButton: false,
                        placement: "top",
                        delay: 300
                    },
                    {
                        title: "Finish",
                        content: "You see the Task you just created in the calendar depending on the previously created Event. Click on \"Done\" to get back to Tutorial.",
                        target: "theOnlyCalendar",
                        placement: "left",
                        xOffset: 150,
                        yOffset: 100,
                        delay: 500
                    }
                ],
                onEnd: function () {
                    ModalService.closeModal();
                    ModalService.openModal('tutorial');
                }
            },
            depOnTask: {
                id: "depOnTask",
                steps: [
                    {
                        title: "New Task",
                        content: "Let us create a Task.",
                        target: "newtask",
                        yOffset: -10,
                        placement: "right",
                        nextOnTargetClick: true,
                        showNextButton: false
                    },
                    {
                        title: "Title",
                        content: "Insert a title, e.g. \"Test the new software\". Click on \"Next\" afterwards.",
                        target: "taskPrimaryInput",
                        xOffset: 10,
                        placement: "bottom",
                        delay: 500
                    },
                    {
                        title: "Save",
                        content: "Let us leave everything else now. Click on \"Save\".",
                        target: "taskSave",
                        nextOnTargetClick: true,
                        showPrevButton: true,
                        xOffset: 10,
                        showNextButton: false,
                        placement: "top",
                        delay: 300
                    },
                    {
                        title: "New Task",
                        content: "Let us create another Task that is blocking the first one.",
                        target: "newtask",
                        delay: 800,
                        yOffset: -10,
                        placement: "right",
                        nextOnTargetClick: true,
                        showNextButton: false
                    },
                    {
                        title: "Title",
                        content: "Insert a title, e.g. \"Install the new software\". Click on \"Next\" afterwards.",
                        target: "taskPrimaryInput",
                        xOffset: 10,
                        placement: "bottom",
                        delay: 500
                    },
                    {
                        title: "Dependency",
                        content: "Now we will add the first Task as being dependent on this one. Select it from the drop-down.",
                        target: "taskDependencies",
                        xOffset: 10,
                        placement: "top"
                    },
                    {
                        title: "Save",
                        content: "Let us leave everything else now. Click on \"Save\".",
                        target: "taskSave",
                        nextOnTargetClick: true,
                        showNextButton: false,
                        xOffset: 10,
                        placement: "top",
                        delay: 300
                    },
                    {
                        title: "Finish",
                        content: "You see the two Tasks now scheduled in the order you specified. Click on \"Done\" to get back to Tutorial.",
                        target: "theOnlyCalendar",
                        placement: "left",
                        xOffset: 150,
                        yOffset: 100,
                        delay: 500
                    }
                ],
                onEnd: function () {
                    ModalService.closeModal();
                    ModalService.openModal('tutorial');
                }
            },
            resources: {
                id: "resources",
                steps: [
                    {
                        title: "Resource Management",
                        content: "Select this item to open the dialog with management of Resources.",
                        target: "resourcesLink",
                        yOffset: -10,
                        placement: "right",
                        nextOnTargetClick: true,
                        showNextButton: false
                    },
                    {
                        title: "Select a Resource",
                        content: "Select a Resource. By default there is only one - for your user.",
                        target: "resourceList",
                        placement: "top",
                        xOffset: 10,
                        delay: 500,
                        nextOnTargetClick: true,
                        showNextButton: false
                    },
                    {
                        title: "Resource Setup",
                        content: "Here you can set the hours / days where SCHEDULOGY will be scheduling Tasks. You can still create Events (with fixed start) with any start time. Click on \"Done\" to go back to Tutorial.",
                        target: "resourceSetupDetail",
                        xOffset: 10,
                        placement: "top",
                        delay: 500
                    }
                ],
                onEnd: function () {
                    ModalService.closeModal();
                    ModalService.closeModal();
                    ModalService.openModal('tutorial');
                }
            }
        };

        this.runTour = function (name, timeout) {
            $timeout(function () {
                hopscotch.startTour(_this.tours[name], 0);
            }, timeout);
        };

        this.endTour = function (timeout) {
            hopscotch.endTour();
        };
    });
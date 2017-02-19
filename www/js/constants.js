angular.module('Schedulogy')
    .constant('constants', {
        loadingTemplate: 'Loading,<br />please wait...',
        applicationName: 'Schedulogy',
        // This is recommended by ionic
        smallScreen: 768,
        appVersion: '2.6.0',
        startHour: 0,
        endHour: 24,
        minuteGranularity: 30,
        defaultRepetition: function (btime) {
            return {
                frequency: 'Weekly',
                end: btime.add(3, 'months')
            };
        }
        ,
        // This has to be exactly calculated using minuteGranularity
        slotsPerHour: 2, // === (60 / minuteGranularity)
        weeks: 26,
        defaultHourShiftFromNow: 24,
        // For 0 - is not all day, 1 - is all day
        defaultTaskDuration: [4, 1],
        defaultTaskType: 'event',
        defaultStateAfterLogin: 'calendar',
        noPrerequisitesToListMsg: 'No possible prerequisites to list. Possible prerequisites are any tasks that can end before the due date of this one.',
        noDependenciesToListMsg: 'No possible dependent tasks to list. Only floating tasks, that are due after this task can be completed, are possible dependent tasks.',
        shiftCalendar: {
            normal: 103,
            smallScreen: 80
        },
        minCalendarRowHeight: 30,
        dateFormat: 'MMM, Do',
        dateFormatLong: 'MMMM, Do',
        timeFormat: 'HH:mm',
        itemColor: function (type, allDay) {
            if (allDay) {
                if (type === 'event')
                    return '#0652D4';
                if (type === 'task')
                    return '#C67F00';
            }
            if (type === 'event')
                return '#387ef5';
            if (type === 'task')
                return '#ffa400';
            if (type === 'reminder')
                return '#bd0000';
        },
        maxEventDuration: [48, 14],
        itemBorderColor: '#111',
        itemTextColor: '#fff',
        feedbackSuccessInfo: 'Feedback received and greatly appreciated.',
        invitationSuccessInfo: 'E-mail sent. Once the recipient switches to your Tenant, you will see a new User in the list of Users.',
        switchTenantSuccessInfo: 'Tenant switched successfully.',
        iCalUploadError: 'File upload failed. Please check that you only upload valid iCal files.',
        iCalUploadSuccess: 'File uploaded successfully.',
        resourceSaveSuccessInfo: 'Calendar saved successfully.'
    });
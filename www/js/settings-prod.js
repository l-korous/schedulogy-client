angular.module('Schedulogy')
    .constant('settings', {
        serverUrl: 'https://www.schedulogy.com/api',
        minPasswordGroups: 2,
        minPasswordLength: 8,
        loadingTemplate: 'Loading,<br />please wait...',
        appVersion: '2.3.5-b',
        applicationName: 'Schedulogy',
        // Fix datetime - has to correspond to the server !!!
        fixedBTime: {
            on: false,
            date: 'Sat Sep 03 2016 12:00:00 GMT+0200'
        },
        weeks: 26,
        defaultHourShiftFromNow: 24,
        // This is recommended by ionic
        smallScreen: 768,
        startHour: 0,
        endHour: 24,
        minuteGranularity: 30,
        // This has to be exactly calculated using minuteGranularity
        slotsPerHour: 2, // === (60 / minuteGranularity)
        // For 0 - is not all day, 1 - is all day
        defaultTaskDuration: [4, 1],
        defaultTaskType: 'event',
        defaultStateAfterLogin: 'main.calendar',
        noPrerequisitesToListMsg: 'No possible prerequisites to list. Possible prerequisites are any tasks that can end before the due date of this one.',
        noDependenciesToListMsg: 'No possible dependent tasks to list. Only floating tasks, that are due after this task can be completed, are possible dependent tasks.',
        shiftCalendar: {
            normal: 103,
            smallScreen: 80
        },
        minCalendarRowHeight: 30,
        checkNewVersion: false,
        dateFormat: 'MMM, Do',
        dateFormatLong: 'MMMM, Do',
        timeFormat: 'HH:mm',
        itemColor: {
            event: '#387ef5',
            task: '#ffa400',
            reminder: '#bd0000'
        },
        maxEventDuration: [48, 14],
        itemBorderColor: '#111',
        itemTextColor: '#fff',
        passwordResetErrorInfo: function (msg) {
            switch (msg) {
                case '!existing':
                    return 'We could not find the requested user. Please register first.';
                    break;
                case 'password':
                    return 'The link is broken. Please make sure you used the full link you got in your e-mail.';
                    break;
                case 'used':
                    return 'The password has already been set. Please reset your password by following the link on the login screen in case you have forgotten it.';
            }
            return 'General error.';
        },
        registrationErrorInfo: function (msg) {
            switch (msg) {
                case 'existing':
                    return 'An account with this e-mail address already exists.';
                    break;
                case 'error':
                    return 'Something is wrong. Please try again.';
                    break;
            }
            return 'General error.';
        },
        loginErrorInfo: function (msg) {
            switch (msg) {
                case 'inactive':
                    return 'This user account is inactive. Please follow the instructions you received via e-mail to activate it.';
                case 'password':
                    return 'Wrong e-mail / password combination.';
            }
            return 'General error.';
        },
        registrationSuccessInfo: 'An e-mail with password setup instructions has been sent to the e-mail address. Please check your inbox.',
        passwordResetSuccessInfo: 'Password successfully set.',
        forgottenPasswordSuccessInfo: 'An e-mail with password reset instructions has been sent to your e-mail address. Please check your inbox.',
        feedbackSuccessInfo: 'Feedback received and greatly appreciated.',
        feedbackErrorInfo: function (msg) {
            return 'Something went wrong.';
        },
        forgottenPasswordErrorInfo: function (msg) {
            switch (msg) {
                case '!existing':
                    return 'We could not find the requested user. Please register first.';
                    break;
            }
            return 'General error.';
        },
        iCalUploadError: 'File upload failed. Please check that you only upload valid iCal files.',
        iCalUploadSuccess: 'File uploaded successfully.',
        resourceSaveSuccessInfo: 'Resource saved successfully.'
    });
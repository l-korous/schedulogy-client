'use strict';
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var bytediff = require('gulp-bytediff');
var wiredep = require('wiredep');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cleanCss = require('gulp-clean-css');
var replace = require('gulp-replace');
var ngAnnotate = require('gulp-ng-annotate');
var del = require('del');
var rename = require('gulp-rename');

gulp.task('concat-js', function () {
    gulp.src([
        "www/js/common/textareaAutogrow.js",
        "www/bower_components/angular-ui-calendar/src/calendar.js",
        "www/bower_components/fullcalendar/dist/fullcalendar.js",
        "www/bower_components/fullcalendar/dist/gcal.js",
        "www/js/app.js",
        "www/js/directives/select.js",
        "www/js/directives/complexPassword.js",
        "www/js/directives/repeatPassword.js",
        "www/js/directives/fileModel.js",
        "www/js/services/dateUtils.js",
        "www/js/services/item.js",
        "www/js/services/auth.js",
        "www/js/services/fileUpload.js",
        "www/js/services/notification.js",
        "www/js/services/cordovaUtilities.js",
        "www/js/services/myItems.js",
        "www/js/services/myUsers.js",
        "www/js/services/myResources.js",
        "www/js/services/fullCalendar.js",
        "www/js/services/modalService.js",
        "www/js/services/hopscotchTour.js",
        "www/js/services/resources/task.js",
        "www/js/services/resources/resource.js",
        "www/js/services/resources/user.js",
        "www/js/controllers/main.js",
        "www/js/controllers/calendar.js",
        "www/js/controllers/helpModal.js",
        "www/js/controllers/privacyPolicyModal.js",
        "www/js/controllers/termsOfServiceModal.js",
        "www/js/controllers/iCalUpload.js",
        "www/js/controllers/taskModal.js",
        "www/js/controllers/eventModal.js",
        "www/js/controllers/reminderModal.js",
        "www/js/controllers/usersModal.js",
        "www/js/controllers/resourcesModal.js",
        "www/js/controllers/login.js",
        "www/js/controllers/registration.js",
        "www/js/controllers/passwordReset.js",
        "www/js/controllers/forgottenPassword.js",
        "www/js/controllers/errorModal.js",
        "www/js/controllers/dirtyTasksModal.js",
        "www/js/controllers/changeUsernameModal.js",
        "www/js/controllers/changePasswordModal.js",
        "www/js/controllers/resourceModal.js",
        "www/js/controllers/feedbackModal.js",
        "www/js/controllers/floatToFixedModal.js",
        "www/js/controllers/userModal.js",
        "www/js/controllers/removeAllModal.js",
        "www/js/controllers/removeResourceModal.js"
    ])
        .pipe(concat('app.min.js'))
        .pipe(bytediff.start())
        .pipe(ngAnnotate({
            add: true
        }))
        .pipe(replace("templateUrl: 'templates/", "templateUrl: 'templates-min/"))
        .pipe(replace("fromTemplateUrl('templates/", "fromTemplateUrl('templates-min/"))
        .pipe(replace('currentItem', 'axe'))
        .pipe(replace('getBTime', 'qaz'))
        .pipe(replace('fillBlocksAndNeedsForShow', 'clockId'))
        .pipe(replace('openUserMenuPopover', 'whatever'))
        .pipe(replace('currentUser', 'uty'))
        .pipe(replace('floatToFixedEvent', 'woopra'))
        .pipe(replace('processEventDuration', 'gfa'))
        .pipe(replace('registrationSuccessInfo', 'bcya'))
        .pipe(replace('passwordResetSuccessInfo', 'bxya'))
        .pipe(replace('myItems', 'axuie'))
        .pipe(replace('successInfo', 'aaq'))
        .pipe(replace('errorInfo', 'aaw'))
        .pipe(replace('reinitDatePicker', 'fgra'))
        .pipe(replace('minuteGranularity', 'concurrentCount'))
        .pipe(replace('defaultTaskDuration', 'oop'))
        .pipe(replace('startHour', '_limit'))
        .pipe(replace('endHour', '_skip'))
        .pipe(replace('FullCalendar', 'TheCalendar'))
        .pipe(replace('fullCalendar', 'theCalendar'))
        .pipe(replace('tryPreauthenticate', 'sendNow'))
        .pipe(replace('TaskType', 'uuida'))
        .pipe(uglify({mangle: true, compress: {
                sequences: true,
                dead_code: true,
                conditionals: true,
                booleans: true,
                unused: true,
                if_return: true,
                join_vars: true,
                drop_console: true,
                warnings: false,
                properties: true,
                comparisons: true,
                evaluate: true,
                loops: true,
                hoist_funs: true,
                cascade: true,
                drop_debugger: true,
                unsafe: true,
                hoist_vars: true,
                negate_iife: true
            }}))
        .pipe(bytediff.stop())
        .pipe(gulp.dest('www/js-min'));
});
gulp.task('clean', function () {
    del(['index.html']);
    del(['www/js-min/app.min.js']);
});
gulp.task('html', function () {
    gulp.src('www/index-min.html').pipe(rename('index.html')).pipe(gulp.dest('www'));
});
gulp.task('template-bundle', function () {
    return gulp.src(['www/templates/*.html', 'www/templates/**/*.html'])
        .pipe(replace('currentItem', 'axe'))
        .pipe(replace('getBTime', 'qaz'))
        .pipe(replace('fillBlocksAndNeedsForShow', 'clockId'))
        .pipe(replace('openUserMenuPopover', 'whatever'))
        .pipe(replace('currentUser', 'uty'))
        .pipe(replace('myItems', 'axuie'))
        .pipe(replace('floatToFixedEvent', 'woopra'))
        .pipe(replace('processEventDuration', 'gfa'))
        .pipe(replace('registrationSuccessInfo', 'bcya'))
        .pipe(replace('passwordResetSuccessInfo', 'bxya'))
        .pipe(replace('successInfo', 'aaq'))
        .pipe(replace('errorInfo', 'aaw'))
        .pipe(replace('reinitDatePicker', 'fgra'))
        .pipe(replace('minuteGranularity', 'concurrentCount'))
        .pipe(replace('defaultTaskDuration', 'oop'))
        .pipe(replace('startHour', '_limit'))
        .pipe(replace('endHour', '_skip'))
        .pipe(replace('FullCalendar', 'TheCalendar'))
        .pipe(replace('fullCalendar', 'theCalendar'))
        .pipe(replace('tryPreauthenticate', 'sendNow'))
        .pipe(replace('TaskType', 'uuida'))
        .pipe(replace('\\r\\n', ''))
        .pipe(replace('\\r', ''))
        .pipe(replace('\\n', ''))
        .pipe(replace('  ', ' '))
        .pipe(replace('  ', ' '))
        .pipe(replace('  ', ' '))
        .pipe(gulp.dest('www/templates-min'));
});
gulp.task('minify-css', function () {
    return gulp.src([
        "www/bower_components/fullcalendar/dist/fullcalendar.min.css",
        "www/css/animate.min.css",
        "www/css/modalAnimations.css",
        "www/css/style.css"
    ])
        .pipe(concat('style.min.css'))
        .pipe(replace('FullCalendar', 'TheCalendar'))
        .pipe(replace('fullCalendar', 'theCalendar'))
        .pipe(cleanCss())
        .pipe(gulp.dest('www/css-min'));
});

gulp.task('minify-css-ionic', function () {
    return gulp.src([
        "www/bower_components/ionic/release/css/ionic.css"
    ])
    .pipe(concat('ionic.min.css'))
        .pipe(replace('\\r\\n', ''))
        .pipe(replace('\\r', ''))
        .pipe(replace('\\n', ''))
        .pipe(replace('  ', ' '))
        .pipe(replace('  ', ' '))
        .pipe(replace('  ', ' '))
        .pipe(gulp.dest('www/bower_components/ionic/release/css/'));
});

// start here
gulp.task('default', function () {
    gulp.start('clean', 'minify-css', 'minify-css-ionic', 'template-bundle', 'concat-js', 'html');
});

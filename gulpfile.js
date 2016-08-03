'use strict';
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var bytediff = require('gulp-bytediff');
var wiredep = require('wiredep');
var obfuscate = require('gulp-obfuscate');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cleanCss = require('gulp-clean-css');
var replace = require('gulp-replace');
var ngAnnotate = require('gulp-ng-annotate');
var del = require('del');
var rename = require('gulp-rename');
var templateCache = require('gulp-angular-templatecache');

gulp.task('concat', function () {
    gulp.src([
        "www/bower_components/ionic/release/js/ionic.bundle.min.js",
        "www/bower_components/jquery/dist/jquery.min.js",
        "www/bower_components/moment/min/moment-with-locales.min.js",
        "www/bower_components/angular-moment/angular-moment.min.js",
        "www/bower_components/angular-resource/angular-resource.min.js",
        "www/bower_components/angular-ui-router/release/angular-ui-router.min.js",
        "www/bower_components/angular-ui-calendar/src/calendar.js",
        "www/bower_components/ionic-datepicker/dist/ionic-datepicker.bundle.min.js",
        "www/bower_components/ionic-timepicker/dist/ionic-timepicker.bundle.min.js",
        "www/bower_components/fullcalendar/dist/fullcalendar.js",
        "www/bower_components/fullcalendar/dist/gcal.js",
        "www/templates-min/templateCache.js",
        "www/js/app.js",
        "www/js/directives/select.js",
        "www/js/directives/complexPassword.js",
        "www/js/directives/repeatPassword.js",
        "www/js/directives/fileModel.js",
        "www/js/services/dateUtils.js",
        "www/js/services/event.js",
        "www/js/services/auth.js",
        "www/js/services/fileUpload.js",
        "www/js/services/cord.js",
        "www/js/services/myEvents.js",
        "www/js/services/fullCalendar.js",
        "www/js/services/resources/task.js",
        "www/js/services/resources/user.js",
        "www/js/controllers/main.js",
        "www/js/controllers/calendar.js",
        "www/js/controllers/helpModal.js",
        "www/js/controllers/iCalUpload.js",
        "www/js/controllers/taskModal.js",
        "www/js/controllers/login.js",
        "www/js/controllers/registration.js",
        "www/js/controllers/passwordReset.js",
        "www/js/controllers/forgottenPassword.js"
    ])
        .pipe(sourcemaps.init())
        // This is badly named on purpose
        .pipe(concat('app.min.js'))
        .pipe(ngAnnotate({
            add: true
        }))
        .pipe(replace("templateUrl: 'templates/", "templateUrl: '"))
        .pipe(replace("fromTemplateUrl('templates/", "fromTemplateUrl('"))
        .pipe(replace('currentEvent', 'axe'))
        .pipe(replace('getBTime', 'qaz'))
        .pipe(replace('fillBlocksAndNeedsForShow', 'clockId'))
        .pipe(replace('openUserMenuPopover', 'whatever'))
        .pipe(replace('currentUser.username', 'utya'))
        .pipe(replace('currentUser', 'uty'))
        .pipe(replace('floatToFixedEvent', 'woopra'))
        .pipe(replace('updateEndDateTimeWithDuration', 'gfa'))
        .pipe(replace('registrationSuccessInfo', 'bcya'))
        .pipe(replace('passwordResetSuccessInfo', 'bxya'))
        .pipe(replace('successInfo', 'aaq'))
        .pipe(replace('errorInfo', 'aaw'))
        .pipe(replace('reinitDatePicker', 'fgra'))
        .pipe(replace('minuteGranularity', 'concurrentCount'))
        .pipe(replace('defaultTaskDuration', 'oop'))
        .pipe(replace('startHour', '_limit'))
        .pipe(replace('endHour', '_skip'))
        .pipe(replace('FullCalendar', 'BootstrapCalendar'))
        .pipe(replace('fullCalendar', 'bootstrapCalendar'))
        .pipe(replace('tryPreauthenticate', 'sendNow'))
        .pipe(replace('TaskType', 'uuida'))
        .pipe(bytediff.start())
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
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('www/js-min'));
});
gulp.task('clean', function () {
    del(['index.html']);
});
gulp.task('html', function () {
    gulp.src('www/index-min.html').pipe(rename('index.html')).pipe(gulp.dest('www'));
});
gulp.task('template-bundle', function () {
    return gulp.src(['www/templates/*.html', 'www/templates/**/*.html'])
        .pipe(templateCache('templateCache.js', { module:'templateCache', standalone:true }))
        .pipe(replace('currentEvent', 'axe'))
        .pipe(replace('getBTime', 'qaz'))
        .pipe(replace('fillBlocksAndNeedsForShow', 'clockId'))
        .pipe(replace('openUserMenuPopover', 'whatever'))
        .pipe(replace('currentUser.username', 'utya'))
        .pipe(replace('currentUser', 'uty'))
        .pipe(replace('floatToFixedEvent', 'woopra'))
        .pipe(replace('updateEndDateTimeWithDuration', 'gfa'))
        .pipe(replace('registrationSuccessInfo', 'bcya'))
        .pipe(replace('passwordResetSuccessInfo', 'bxya'))
        .pipe(replace('successInfo', 'aaq'))
        .pipe(replace('errorInfo', 'aaw'))
        .pipe(replace('reinitDatePicker', 'fgra'))
        .pipe(replace('minuteGranularity', 'concurrentCount'))
        .pipe(replace('defaultTaskDuration', 'oop'))
        .pipe(replace('startHour', '_limit'))
        .pipe(replace('endHour', '_skip'))
        .pipe(replace('FullCalendar', 'BootstrapCalendar'))
        .pipe(replace('fullCalendar', 'bootstrapCalendar'))
        .pipe(replace('tryPreauthenticate', 'sendNow'))
        .pipe(replace('TaskType', 'uuida'))
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
        .pipe(cleanCss())
        .pipe(gulp.dest('www/css-min'));
});

// start here
gulp.task('default', function () {
    gulp.start('minify-css', 'template-bundle', 'concat', 'clean', 'html');
});

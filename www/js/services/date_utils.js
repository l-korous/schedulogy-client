angular.module('Scheduler')
    .factory('DateUtils', function (moment, settings) {
        var DateUtils = {
            pushDatePart: function (src, dst) {
                if (!dst) {
                    var now_ = moment(new Date());
                    src.hour((now_.hour() + 1) % 24);
                    // TODO - if we change the step, this has to be changed.
                    src.minute(0);
                    src.second(0);
                }
                else {
                    src.hour(dst.hour());
                    src.minute(dst.minute());
                    src.second(dst.second());
                }
                return src;
            },
            pushTime: function (src, dst) {
                var toReturn = dst || moment(new Date());

                toReturn.hour(src / 3600);
                // TODO - if we change the step, this has to be changed.
                toReturn.minute(0);
                toReturn.second(0);

                return toReturn;
            },
            getBTime: function () {
                if (settings.fixedBTime)
                    return moment(settings.fixedBTime.date);
                else
                    return moment(new Date()).add('hours', 1).minutes(0).seconds(0);
            }
        };
        return DateUtils;
    });

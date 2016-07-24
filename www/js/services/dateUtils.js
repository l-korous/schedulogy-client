angular.module('Schedulogy')
    .factory('DateUtils', function (moment, settings) {
        return {
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
                toReturn.minute((src % 3600) / 60);
                toReturn.second(0);

                return toReturn;
            },
            ToMinutes: function (momentTime) {
                return ((momentTime.hour() * 60) + momentTime.minute());
            },
            ToMinutesPlusDuration: function (momentTime, addedDuration) {
                return ((momentTime.hour() * 60) + momentTime.minute() + (addedDuration * settings.minuteGranularity));
            },
            equalDays: function (momentTime1, momentTime2) {
                return (momentTime1.format("YYYY-MM-DD") === momentTime2.format("YYYY-MM-DD"));
            }
        };
    });

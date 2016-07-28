angular.module('Schedulogy')
    .controller('ICalUploadCtrl', function ($scope, $rootScope, MyEvents, settings, fileUpload, $ionicLoading) {
        // For display purposes only.
        $scope.weeksFromSettings = settings.weeks;

        $scope.uploadFile = function () {
            $ionicLoading.show({template: settings.loadingTemplate});

            // This is done through rootScope, because otherwise it would not work. Not a big deal, but may be fixed.
            var file = $rootScope.icalFile;

            fileUpload.uploadFileToUrl(file, settings.serverUrl + '/ical', {btime: MyEvents.getBTime().unix()}, function (data) {
                MyEvents.tasksInResponseSuccessHandler(data, function () {
                    $scope.$parent.closeUploadIcalModal();
                    $rootScope.icalFile = null;
                });
            },
                function (err) {
                    MyEvents.tasksInResponseErrorHandler(err, function () {
                        $scope.$parent.closeUploadIcalModal();
                        $rootScope.icalFile = null;
                    });
                });
        };
    });

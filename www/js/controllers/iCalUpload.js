angular.module('Schedulogy')
    .controller('ICalUploadCtrl', function ($scope, $rootScope, MyEvents, settings, fileUpload, $ionicLoading) {
        // Register confirm callback in parent.
        $scope.$parent.modals.uploadIcal.confirmCallback = function () {
            $scope.uploadFile();
        };

        // For display purposes only.
        $scope.weeksFromSettings = settings.weeks;

        $scope.uploadFile = function () {
            $ionicLoading.show({template: settings.loadingTemplate});

            // This is done through rootScope, because otherwise it would not work. Not a big deal, but may be fixed.
            var file = $rootScope.icalFile;

            fileUpload.uploadFileToUrl(file, settings.serverUrl + '/ical', {btime: MyEvents.getBTime().unix()}, function (data) {
                MyEvents.tasksInResponseSuccessHandler(data, function () {
                    $scope.$parent.closeModal('uploadIcal');
                    $rootScope.icalFile = null;
                });
            },
                function (err) {
                    console.log(err);
                    try {
                        MyEvents.tasksInResponseErrorHandler(err, function () {
                            $scope.$parent.closeModal('uploadIcal');
                            $rootScope.icalFile = null;
                        });
                    }
                    catch (e) {
                        $scope.errorInfo = settings.iCalUploadError;
                    }
                });
        };
    });

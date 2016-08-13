angular.module('Schedulogy')
    .controller('ICalUploadCtrl', function ($scope, $rootScope, MyEvents, settings, fileUpload, $ionicLoading, $timeout) {
        // Register confirm callback in parent.
        $scope.$parent.modals.uploadIcal.confirmCallback = function () {
            $scope.uploadFile();
        };
        $scope.$parent.modals.uploadIcal.closeCallback = function () {
            $scope.successInfo = null;
            $scope.errorInfo = null;
        };

        // For display purposes only.
        $scope.weeksFromSettings = settings.weeks;

        $scope.uploadFile = function () {
            $ionicLoading.show({template: settings.loadingTemplate});

            // This is done through rootScope, because otherwise it would not work. Not a big deal, but may be fixed.
            var file = $rootScope.icalFile;

            fileUpload.uploadFileToUrl(file, settings.serverUrl + '/ical', {}, function (data) {
                MyEvents.tasksInResponseSuccessHandler(data, function () {
                    $scope.successInfo = settings.iCalUploadSuccess;
                    $timeout(function () {
                        $scope.$parent.closeModal('uploadIcal');
                        $scope.successInfo = null;
                        $scope.errorInfo = null;
                    }, 2000);
                    $rootScope.icalFile = null;
                });
            },
                function (err) {
                    try {
                        MyEvents.tasksInResponseErrorHandler(err, function () {
                            $scope.$parent.closeModal('uploadIcal');
                            $scope.successInfo = null;
                            $scope.errorInfo = null;
                            $rootScope.icalFile = null;
                        });
                    }
                    catch (e) {
                        $scope.errorInfo = settings.iCalUploadError;
                    }
                });
        };
    });

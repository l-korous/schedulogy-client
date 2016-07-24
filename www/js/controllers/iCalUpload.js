angular.module('Schedulogy')
    .controller('ICalUploadCtrl', function ($scope, $rootScope, MyEvents, settings, fileUpload, $ionicLoading) {
        $scope.uploadFile = function () {
            $ionicLoading.show({template: settings.loadingTemplate});
            var file = $rootScope.icalFile;
            var uploadUrl = settings.serverUrl + '/ical';
            fileUpload.uploadFileToUrl(file, uploadUrl, {btime: MyEvents.getBTime().unix()}, function (data) {
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

angular.module('Schedulogy')
    .controller('ICalUploadCtrl', function ($scope, $http, $rootScope, MyEvents, settings, fileUpload, $ionicLoading) {
        $scope.uploadFile = function () {
            $ionicLoading.show({template: settings.loadingTemplate});
            var file = $rootScope.icalFile;
            var uploadUrl = settings.serverUrl + '/ical';
            fileUpload.uploadFileToUrl(file, uploadUrl, {btime: MyEvents.getBTime().unix()}, function (data) {
                MyEvents.tasksInResponseSuccessHandler(data);
            },
                function (err) {
                    MyEvents.tasksInResponseErrorHandler(err);
                });
        };
    });

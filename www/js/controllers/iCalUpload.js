angular.module('Schedulogy')
    .controller('ICalUploadModalCtrl', function ($scope, $rootScope, MyEvents, settings, fileUpload, $ionicLoading, $timeout, ModalService) {
        $scope.open = function () {
            $scope.successInfo = null;
            $scope.errorInfo = null;
            ModalService.openModalInternal('iCalUpload');
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('iCalUpload', $scope, $scope.open, $scope.close);

        $scope.save = function () {
            if ($scope.form.$invalid)
                return;
            if ($rootScope.icalFile)
                $scope.uploadFile();
        };

        // For display purposes only.
        $scope.weeksFromSettings = settings.weeks;

        $scope.uploadFile = function () {
            $ionicLoading.show({template: settings.loadingTemplate});

            // This is done through rootScope, because otherwise it somehow does not work. Not a big deal, but may be fixed.
            var file = $rootScope.icalFile;

            fileUpload.uploadFileToUrl(file, settings.serverUrl + '/ical', {btime: MyEvents.getBTime().unix()}, function (data) {
                MyEvents.tasksInResponseSuccessHandler(data, function () {
                    $scope.successInfo = settings.iCalUploadSuccess;
                    $timeout(function () {
                        ModalService.closeModalInternal();
                        $scope.successInfo = null;
                    }, 2000);
                    $rootScope.icalFile = null;
                    $scope.errorInfo = null;
                    $ionicLoading.hide();
                });
            },
                function (err) {
                    try {
                        MyEvents.tasksInResponseErrorHandler(err, function () {
                            ModalService.closeModalInternal();
                            $scope.successInfo = null;
                            $scope.errorInfo = settings.iCalUploadError;
                            $rootScope.icalFile = null;
                            $ionicLoading.hide();
                        });
                    }
                    catch (e) {
                        $scope.successInfo = null;
                        $scope.errorInfo = settings.iCalUploadError;
                        $rootScope.icalFile = null;
                        $ionicLoading.hide();
                    }
                });
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'iCalUpload')
                $scope.close();
        });

        $scope.$on('Enter', function () {
            if (ModalService.currentModal === 'iCalUpload')
                $scope.save();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['iCalUpload'].modal.remove();
        });
    });

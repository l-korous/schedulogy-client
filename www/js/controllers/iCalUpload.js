angular.module('Schedulogy')
    .controller('ICalUploadModalCtrl', function ($scope, $rootScope, MyItems, settings, fileUpload, $timeout, ModalService) {
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

        $scope.uploadFile = function () {
            $rootScope.isLoading = true;

            // This is done through rootScope, because otherwise it somehow does not work. Not a big deal, but may be fixed.
            var file = $rootScope.icalFile;

            fileUpload.uploadFileToUrl(file, settings.serverUrl + '/ical', {btime: MyItems.getBTime().unix()}, function (data) {
                MyItems.tasksInResponseSuccessHandler(data, function () {
                    $scope.successInfo = settings.iCalUploadSuccess;
                    $rootScope.icalFile = null;
                    $scope.errorInfo = null;
                    $rootScope.isLoading = false;
                });
            },
                function (err) {
                    try {
                        MyItems.tasksInResponseErrorHandler(err, function () {
                            ModalService.closeModalInternal();
                            $scope.successInfo = null;
                            $scope.errorInfo = settings.iCalUploadError;
                            $rootScope.icalFile = null;
                            $rootScope.isLoading = false;
                        });
                    }
                    catch (e) {
                        $scope.successInfo = null;
                        $scope.errorInfo = settings.iCalUploadError;
                        $rootScope.icalFile = null;
                        $rootScope.isLoading = false;
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

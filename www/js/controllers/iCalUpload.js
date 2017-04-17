angular.module('Schedulogy')
    .controller('ICalUploadModalCtrl', function ($scope, $rootScope, MyItems, settings, fileUpload, constants, ModalService) {
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
            $('#theOnlyCalendar').fullCalendar('startRefreshingSpinner');

            // This is done through rootScope, because otherwise it somehow does not work. Not a big deal, but may be fixed.
            var file = $rootScope.icalFile;

            fileUpload.uploadFileToUrl(file, settings.serverUrl + '/ical', {btime: MyItems.getBTime().unix()}, function (data) {
                MyItems.tasksInResponseSuccessHandler(data, function () {
                    $scope.successInfo = constants.iCalUploadSuccess;
                    $rootScope.icalFile = null;
                    $scope.errorInfo = null;
                    $('#theOnlyCalendar').fullCalendar('stopRefreshingSpinner');
                });
            }, function (err) {
                try {
                    MyItems.tasksInResponseErrorHandler(err, function () {
                        ModalService.closeModalInternal();
                        $scope.successInfo = null;
                        $scope.errorInfo = constants.iCalUploadError;
                        $rootScope.icalFile = null;
                        $('#theOnlyCalendar').fullCalendar('stopRefreshingSpinner');
                    });
                }
                catch (e) {
                    $scope.successInfo = null;
                    $scope.errorInfo = constants.iCalUploadError;
                    $rootScope.icalFile = null;
                    $('#theOnlyCalendar').fullCalendar('stopRefreshingSpinner');
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

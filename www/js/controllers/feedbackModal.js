angular.module('Schedulogy')
    .controller('FeedbackModalCtrl', function ($scope, settings, $http, ModalService, $ionicLoading) {
        ModalService.createModal('feedback', $scope, {}, $scope.open, $scope.close);

        $scope.open = function () {
            $scope.data = {
                feedbackText: '',
                successInfo: '',
                errorInfo: ''
            };

            ModalService.openModalInternal('feedback');
        };

        $scope.close = function () {
            $scope.floatToFixedRevertFunc && $scope.floatToFixedRevertFunc();
            ModalService.closeModalInternal();
        };

        $scope.save = function () {
            if($scope.form.$invalid)
                return;
            
            $scope.beingSubmitted = true;
            $ionicLoading.show({template: settings.loadingTemplate});
            $http.post(settings.serverUrl + '/msg', {msg: $scope.data.feedbackText})
                .success(function () {
                    $ionicLoading.hide();
                    $scope.successInfo = settings.feedbackSuccessInfo;
                })
                .error(function (errorResponse) {
                    $ionicLoading.hide();
                    $scope.errorInfo = settings.feedbackErrorInfo(errorResponse.msg);
                });
            ModalService.closeModalInternal();
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'feedback')
                $scope.close();
        });

        $scope.$on('Enter', function () {
            if (ModalService.currentModal === 'feedback')
                $scope.save();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['feedback'].modal.remove();
        });
    });

angular.module('Schedulogy')
    .controller('FeedbackModalCtrl', function ($scope, settings, $http, ModalService, $rootScope) {
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

        ModalService.initModal('feedback', $scope, $scope.open, $scope.close);

        $scope.save = function () {
            $scope.beingSubmitted = true;
            if ($scope.form.$invalid)
                return;

            $rootScope.isLoading = true;
            $http.post(settings.serverUrl + '/msg', {msg: $scope.data.feedbackText})
                .success(function () {
                    $rootScope.isLoading = false;
                    $scope.successInfo = settings.feedbackSuccessInfo;
                })
                .error(function (errorResponse) {
                    $rootScope.isLoading = false;
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

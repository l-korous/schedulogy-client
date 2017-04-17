angular.module('Schedulogy')
    .controller('FeedbackModalCtrl', function ($scope, settings, $http, ModalService, $rootScope, constants) {
        $scope.open = function () {
            $scope.data = {
                feedbackText: '',
                successInfo: '',
                errorInfo: ''
            };

            ModalService.openModalInternal('feedback', function () {
                var primaryInput = $(ModalService.modals.feedback.modalInternal.modalEl).find('#feedbackModalTextarea');
                primaryInput.focus();
                primaryInput.select();
                $(function () {
                    $('#feedbackModalTextarea').autogrow();
                });
            });
        };

        $scope.close = function () {
            $scope.floatToFixedRevertFunc && $scope.floatToFixedRevertFunc();
            ModalService.closeModalInternal();
        };

        ModalService.initModal('feedback', $scope, $scope.open, $scope.close);

        $scope.save = function () {
            if ($scope.form.$invalid)
                return;

            $('#theOnlyCalendar').fullCalendar('startRefreshingSpinner');
            $http.post(settings.serverUrl + '/msg', {msg: $scope.data.feedbackText})
                .success(function () {
                    $('#theOnlyCalendar').fullCalendar('stopRefreshingSpinner');
                    $scope.data.successInfo = constants.feedbackSuccessInfo;
                })
                .error(function (errorResponse) {
                    $('#theOnlyCalendar').fullCalendar('stopRefreshingSpinner');
                    $scope.data.errorInfo = errorResponse.msg;
                });
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

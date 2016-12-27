angular.module('Schedulogy')
    .controller('InvitationModalCtrl', function ($http, $scope, settings, ModalService, $rootScope, constants) {
        $scope.modalService = ModalService;

        $scope.open = function () {
            $scope.data = {
                inviteeEmail: '',
                successInfo: '',
                errorInfo: ''
            };

            ModalService.openModalInternal('invitation', function () {
                var primaryInput = $(ModalService.modals.invitation.modalInternal.modalEl).find('#inviteModalEmail');
                primaryInput.focus();
                primaryInput.select();
            });
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('invitation', $scope, $scope.open, $scope.close);

        $scope.invite = function () {
            if ($scope.form.$invalid)
                return;

            $rootScope.isLoading = true;
            $http.post(settings.serverUrl + '/inviteToTenant', {email: $scope.data.inviteeEmail})
                .success(function () {
                    $rootScope.isLoading = false;
                    $scope.data.successInfo = constants.invitationSuccessInfo;
                })
                .error(function (errorResponse) {
                    $rootScope.isLoading = false;
                    $scope.data.errorInfo = errorResponse.msg;
                });
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'invitation')
                $scope.close();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['invitation'].modal.remove();
        });
    });

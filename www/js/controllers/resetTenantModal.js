angular.module('Schedulogy')
    .controller('ResetTenantModalCtrl', function (constants, $scope, settings, ModalService, $rootScope, $http, Auth, MyUsers, MyResources, MyItems, $timeout) {
        $scope.modalService = ModalService;

        $scope.open = function () {
            $scope.data = {
                successInfo: '',
                errorInfo: ''
            };

            ModalService.openModalInternal('resetTenant', function () {
                var primaryInput = $(ModalService.modals.resetTenant.modalInternal.modalEl).find('#tenantCode');
                primaryInput.focus();
                primaryInput.select();
            });
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('resetTenant', $scope, $scope.open, $scope.close);

        $scope.reset = function () {
            if ($scope.form.$invalid)
                return;

            $scope.data.successInfo = '';
            $scope.data.errorInfo = '';

            $rootScope.isLoading = true;
            $http.post(settings.serverUrl + '/switchTenant', {tenantCode: MyUsers.originalTenantCode})
                .success(function (data) {
                    Auth.processToken(data.token);
                    $scope.data.successInfo = constants.switchTenantSuccessInfo;
                    $timeout(function () {
                        MyResources.refresh();
                        MyUsers.refresh();
                        MyItems.refresh();
                        $rootScope.isLoading = false;
                    });
                })
                .error(function (errorResponse) {
                    $rootScope.isLoading = false;
                    $scope.data.errorInfo = errorResponse.msg;
                });
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'resetTenant')
                $scope.close();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['resetTenant'].modal.remove();
        });
    });

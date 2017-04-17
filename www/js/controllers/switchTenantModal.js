angular.module('Schedulogy')
    .controller('SwitchTenantModalCtrl', function (constants, $scope, settings, ModalService, $rootScope, $http, Auth, MyUsers, MyResources, MyItems, $timeout) {
        $scope.modalService = ModalService;

        $scope.open = function () {
            $scope.data = {
                tenantCode: '',
                successInfo: '',
                errorInfo: ''
            };

            ModalService.openModalInternal('switchTenant', function () {
                var primaryInput = $(ModalService.modals.switchTenant.modalInternal.modalEl).find('#tenantCode');
                primaryInput.focus();
                primaryInput.select();
            });
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('switchTenant', $scope, $scope.open, $scope.close);

        $scope.change = function () {
            if ($scope.form.$invalid)
                return;

            $scope.data.successInfo = '';
            $scope.data.errorInfo = '';

            $('#theOnlyCalendar').fullCalendar('startRefreshingSpinner');
            $http.post(settings.serverUrl + '/switchTenant', {tenantCode: $scope.data.tenantCode})
                .success(function (data) {
                    Auth.processToken(data.token);
                    $scope.data.successInfo = constants.switchTenantSuccessInfo;
                    $timeout(function () {
                        MyResources.refresh();
                        MyUsers.refresh();
                        MyItems.refresh();
                        $('#theOnlyCalendar').fullCalendar('stopRefreshingSpinner');
                    });
                })
                .error(function (errorResponse) {
                    $('#theOnlyCalendar').fullCalendar('stopRefreshingSpinner');
                    $scope.data.errorInfo = errorResponse.msg;
                });
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'switchTenant')
                $scope.close();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['switchTenant'].modal.remove();
        });
    });

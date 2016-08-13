angular.module('Schedulogy')
    .controller("RegistrationCtrl", function ($scope, Auth, $ionicLoading, settings, $timeout, $state) {
        $scope.successInfo = null;
        $scope.errorInfo = null;
        $scope.data = {};
        $scope.beingSubmitted = false;
        $('#emailEdit').focus();

        $scope.register = function () {
            $ionicLoading.show({template: settings.loadingTemplate});
            $scope.errorInfo = null;
            $scope.beingSubmitted = true;
            Auth.register({email: $scope.data.email}).success(function () {
                $ionicLoading.hide();
                $scope.successInfo = settings.registrationSuccessInfo;
            }).error(function (errorResponse) {
                $ionicLoading.hide();
                $scope.errorInfo = settings.registrationErrorInfo(errorResponse.msg);
            });
        };
    });
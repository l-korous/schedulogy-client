angular.module('Schedulogy')
    .controller("RegistrationCtrl", function ($scope, Auth, $ionicLoading, settings, $timeout, $state) {
        $scope.successInfo = null;
        $scope.errorInfo = null;
        $scope.beingSubmitted = false;
        $scope.data = {};
        $('#emailEdit').focus();

        $scope.register = function () {
            $scope.beingSubmitted = true;
            if ($scope.form.$invalid)
                return;
            if (!$scope.registrationForm.$invalid) {
                $scope.errorInfo = null;
                $ionicLoading.show({template: settings.loadingTemplate});
                Auth.register({email: $scope.data.email}).success(function () {
                    $ionicLoading.hide();
                    $scope.successInfo = settings.registrationSuccessInfo;
                }).error(function (errorResponse) {
                    $ionicLoading.hide();
                    $scope.errorInfo = settings.registrationErrorInfo(errorResponse.msg);
                });
            }
        };
    });
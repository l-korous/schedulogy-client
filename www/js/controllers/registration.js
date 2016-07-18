angular.module('Schedulogy')
    .controller("RegistrationCtrl", function ($scope, Auth, $rootScope, settings, $timeout, $state) {
        $scope.successInfo = null;
        $scope.errorInfo = null;
        $scope.data = {};
        $scope.beingSubmitted = false;
        $('#emailEdit').focus();
        
        $scope.keyUpHandler = function (keyCode, formInvalid) {
            if (keyCode === 13 && !formInvalid) {
                $scope.register();
            }
        };

        $scope.register = function () {
            $scope.errorInfo = null;
            $scope.beingSubmitted = true;
            Auth.register({email: $scope.data.email}).success(function () {
                $scope.successInfo = settings.registrationSuccessInfo;
            }).error(function (errorResponse) {
                $scope.errorInfo = settings.registrationErrorInfo(errorResponse.message);
            });
        };
    });
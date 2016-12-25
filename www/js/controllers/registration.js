angular.module('Schedulogy')
    .controller("RegistrationCtrl", function ($scope, Auth, settings, $timeout, $state, $rootScope, moment) {
        $scope.successInfo = null;
        $scope.errorInfo = null;
        $scope.beingSubmitted = false;
        $scope.data = {};
        $timeout(function () {
            $('#emailEdit').focus();
        });

        $scope.register = function () {
            $scope.beingSubmitted = true;
            if ($scope.form.$invalid)
                return;
            if (!$scope.form.$invalid) {
                $rootScope.isLoading = true;
                $scope.errorInfo = null;
                Auth.register({email: $scope.data.email, timezone: moment.tz.guess()}, function () {
                    $rootScope.isLoading = false;
                    $scope.successInfo = settings.registrationSuccessInfo;
                }, function (errorResponse) {
                    $rootScope.isLoading = false;
                    $scope.errorInfo = settings.registrationErrorInfo(errorResponse.msg);
                });
            }
        };
    });
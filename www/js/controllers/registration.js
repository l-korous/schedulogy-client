angular.module('Schedulogy')
        .controller("RegistrationCtrl", function ($scope, Auth, settings, $timeout, $state, $rootScope) {
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
                    $scope.errorInfo = null;
                    $rootScope.isLoading = true;
                    Auth.register({email: $scope.data.email}).success(function () {
                        $rootScope.isLoading = false;
                        $scope.successInfo = settings.registrationSuccessInfo;
                    }).error(function (errorResponse) {
                        $rootScope.isLoading = false;
                        $scope.errorInfo = settings.registrationErrorInfo(errorResponse.msg);
                    });
                }
            };
        });
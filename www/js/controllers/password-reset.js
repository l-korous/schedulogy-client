angular.module('Schedulogy')
    .controller("PasswordResetCtrl", function ($scope, Auth, $location, settings, $ionicLoading, $rootScope, $timeout) {
        $scope.successInfo = null;
        $scope.errorInfo = null;
        $scope.data = {};
        $scope.beingSubmitted = false;
        
        $scope.userId = $location.search().user;
        $scope.passwordResetHash = $location.search().id;
        $ionicLoading.show({
            template: 'Loading...'
        });
        $scope.keyUpHandler = function (keyCode, formInvalid) {
            if (keyCode === 13 && !formInvalid) {
                $scope.setPassword();
            }
        };

        Auth.checkPasswordResetLink($scope.userId, $scope.passwordResetHash).success(function () {
            $ionicLoading.hide();
        }).error(function (response) {
            $ionicLoading.hide();
            $scope.info = settings.passwordResetLinkInvalidString(response.data.message);
        });
        
        $scope.setPassword = function () {
            $scope.errorInfo = null;
            $scope.beingSubmitted = true;
            $ionicLoading.show({
                template: 'Loading...'
            });
            Auth.activate($scope.data.password, $scope.userId, $scope.passwordResetHash).success(function (response) {
                $ionicLoading.hide();
                $scope.successInfo = settings.passwordResetSuccessInfo;
            }).error(function (errorResponse) {
                $ionicLoading.hide();
                $scope.info = settings.passwordResetErrorInfo(errorResponse.data.message);
            });
        };
    });
angular.module('Schedulogy')
    .controller("PasswordResetCtrl", function ($scope, Auth, $location, settings, $ionicLoading, $rootScope, $timeout) {
        $scope.passwordRules

        $scope.successInfo = null;
        $scope.errorInfo = null;
        $scope.data = {};
        $scope.beingSubmitted = false;

        $scope.userId = $location.search().user;
        $scope.passwordResetHash = $location.search().id;
        $ionicLoading.show({
            template: settings.loadingTemplate
        });
        $scope.$on('Enter', function () {
            $scope.setPassword();
        });

        Auth.checkPasswordResetLink($scope.userId, $scope.passwordResetHash).success(function () {
            $ionicLoading.hide();
        }).error(function (errorResponse) {
            $ionicLoading.hide();
            $scope.errorInfo = settings.passwordResetErrorInfo(errorResponse.msg);
        });

        $scope.setPassword = function () {
            $scope.errorInfo = null;
            $scope.beingSubmitted = true;
            $ionicLoading.show({
                template: settings.loadingTemplate
            });
            Auth.activate($scope.data.password, $scope.userId, $scope.passwordResetHash).success(function (response) {
                $ionicLoading.hide();
                $scope.successInfo = settings.passwordResetSuccessInfo;
            }).error(function (errorResponse) {
                $ionicLoading.hide();
                $scope.errorInfo = settings.passwordResetErrorInfo(errorResponse.msg);
            });
        };
    });
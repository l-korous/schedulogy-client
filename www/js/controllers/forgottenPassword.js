angular.module('Schedulogy')
    .controller('ForgottenPasswordCtrl', function (settings, $scope, Auth, $ionicLoading) {
        $scope.data = {};
        $('#emailEdit').focus();
        $scope.sendPasswordResetLink = function () {
            $scope.beingSubmitted = true;
            $ionicLoading.show({template: settings.loadingTemplate});
            $scope.errorInfo = null;
            Auth.sendPasswordResetLink($scope.data.email).then(function () {
                $scope.successInfo = settings.forgottenPasswordSuccessInfo;
                $ionicLoading.hide();
            }, function (msg) {
                $scope.errorInfo = settings.forgottenPasswordErrorInfo(msg);
                $ionicLoading.hide();
            });
        };
    });
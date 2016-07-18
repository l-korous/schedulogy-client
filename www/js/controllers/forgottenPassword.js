angular.module('Schedulogy')
    .controller('ForgottenPasswordCtrl', function (settings, $scope, Auth) {
        $scope.data = {};
        $('#emailEdit').focus();
        $scope.sendPasswordResetLink = function () {
            $scope.beingSubmitted = true;
            $scope.errorInfo = null;
            Auth.sendPasswordResetLink($scope.data.email).then(function () {
                $scope.successInfo = settings.forgottenPasswordSuccessInfo;
            }, function (msg) {
                $scope.errorInfo = settings.forgottenPasswordErrorInfo(msg);
            });
        };
    });
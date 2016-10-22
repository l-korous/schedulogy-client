angular.module('Schedulogy')
    .controller('ForgottenPasswordCtrl', function (settings, $scope, Auth, $rootScope) {
        $scope.data = {};
        $('#emailEdit').focus();
        $scope.sendPasswordResetLink = function () {
            $scope.beingSubmitted = true;
            if ($scope.form.$invalid)
                return;
            $rootScope.isLoading = true;
            $scope.errorInfo = null;
            Auth.sendPasswordResetLink($scope.data.email, function () {
                $scope.successInfo = settings.forgottenPasswordSuccessInfo;
                $rootScope.isLoading = false;
            }, function (msg) {
                $scope.errorInfo = settings.forgottenPasswordErrorInfo(msg);
                $rootScope.isLoading = false;
            });
        };
    });
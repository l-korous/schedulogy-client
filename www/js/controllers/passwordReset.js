angular.module('Schedulogy')
    .controller("PasswordResetCtrl", function ($scope, Auth, $location, settings, $rootScope, MyItems, MyResources, MyUsers, $timeout, $state) {
        $scope.successInfo = null;
        $scope.errorInfo = null;
        $scope.data = {};
        $scope.beingSubmitted = false;
        $scope.linkChecked = false;
        $scope.passwordRules = {
            minGroups: settings.minPasswordGroups,
            minLength: settings.minPasswordLength
        };

        $scope.userId = $location.search().user;
        $scope.passwordResetHash = $location.search().id;
        $rootScope.isLoading = true;

        $scope.$on('Enter', function () {
            $scope.setPassword();
        });

        Auth.checkPasswordResetLink($scope.userId, $scope.passwordResetHash, function () {
            $rootScope.isLoading = false;
            $timeout(function () {
                $scope.linkChecked = true;
            });
        }, function (errorResponse) {
            $rootScope.isLoading = false;
            $timeout(function () {
                $scope.linkChecked = true;
            });
            $scope.errorInfo = settings.passwordResetErrorInfo(errorResponse.msg);
        });

        $scope.setPassword = function () {
            $scope.beingSubmitted = true;
            if ($scope.form.$invalid)
                return;
            $scope.errorInfo = null;
            $rootScope.isLoading = true;
            Auth.activate($scope.data.password, $scope.userId, $scope.passwordResetHash, function (activateResponse) {
                Auth.tryLogin({email: activateResponse.email, password: $scope.data.password}).then(function (loginResponse) {
                    MyItems.refresh();
                    MyResources.refresh();
                    MyUsers.refresh();
                    $location.path('');
                    $location.search('');
                    $rootScope.isLoading = false;
                    $state.go(settings.defaultStateAfterLogin, {}, {location: false});
                }, function (msg) {
                    $scope.errorInfo = settings.loginErrorInfo(msg);
                });
            }, function (errorResponse) {
                $rootScope.isLoading = false;
                $scope.errorInfo = settings.passwordResetErrorInfo(errorResponse.msg);
            });
        };
    });
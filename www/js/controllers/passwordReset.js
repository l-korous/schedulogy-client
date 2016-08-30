angular.module('Schedulogy')
    .controller("PasswordResetCtrl", function ($scope, Auth, $location, settings, $ionicLoading, Hopscotch, $rootScope, MyEvents, MyResources, MyUsers, $timeout, $state) {
        $scope.successInfo = null;
        $scope.errorInfo = null;
        $scope.data = {};
        $scope.beingSubmitted = false;
        $scope.linkChecked = false;

        $scope.userId = $location.search().user;
        $scope.passwordResetHash = $location.search().id;
        $ionicLoading.show({template: settings.loadingTemplate});

        $scope.$on('Enter', function () {
            $scope.setPassword();
        });

        Auth.checkPasswordResetLink($scope.userId, $scope.passwordResetHash).success(function () {
            $ionicLoading.hide();
            $timeout(function () {
                $scope.linkChecked = true;
            });
        }).error(function (errorResponse) {
            $ionicLoading.hide();
            $timeout(function () {
                $scope.linkChecked = true;
            });
            $scope.errorInfo = settings.passwordResetErrorInfo(errorResponse.msg);
        });

        $scope.setPassword = function () {
            $scope.beingSubmitted = true;
            if (!$scope.passwordResetForm.$invalid) {
                $scope.errorInfo = null;
                $ionicLoading.show({template: settings.loadingTemplate});
                Auth.activate($scope.data.password, $scope.userId, $scope.passwordResetHash).success(function (activateResponse) {
                    $ionicLoading.hide();
                    Auth.tryLogin({email: activateResponse.email, password: $scope.data.password}).then(function (loginResponse) {
                        MyEvents.refresh();
                        MyResources.refresh();
                        MyUsers.refresh();
                        $location.path('');
                        $location.search('');
                        $state.go(settings.defaultStateAfterLogin, {}, {location: false});
                        if (loginResponse.runIntro && !$rootScope.isMobileNarrow && !$rootScope.isMobileLow)
                            Hopscotch.runTour(750);
                    }, function (msg) {
                        $scope.errorInfo = settings.loginErrorInfo(msg);
                    });
                }).error(function (errorResponse) {
                    $ionicLoading.hide();
                    $scope.errorInfo = settings.passwordResetErrorInfo(errorResponse.msg);
                });
            }
        };
    });
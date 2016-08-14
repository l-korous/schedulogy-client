angular.module('Schedulogy')
    .controller('LoginCtrl', function (settings, $scope, Auth, $state, Hopscotch, $rootScope, MyEvents, MyResources, MyUsers) {
        $scope.data = {};
        $scope.goToRegistration = function () {
            $state.go("main.registration", {}, {location: false});
        };
        $scope.goToForgottenPassword = function () {
            $state.go("main.forgottenPassword", {}, {location: false});
        };
        $('#emailEdit').focus();
        $scope.login = function () {
            Auth.tryLogin({email: $scope.data.email, password: $scope.data.password}).then(function (data) {
                MyEvents.refresh();
                MyResources.refresh();
                MyUsers.refresh();
                $state.go(settings.defaultStateAfterLogin, {}, {location: false});
                if (data.runIntro && !$rootScope.isMobileNarrow && !$rootScope.isMobileLow)
                    Hopscotch.runTour(750);
            }, function (msg) {
                $scope.errorInfo = settings.loginErrorInfo(msg);
            });
        };
    });
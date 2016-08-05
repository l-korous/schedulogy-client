angular.module('Schedulogy')
    .controller('LoginCtrl', function (settings, $scope, Auth, $state, Hopscotch) {
        $scope.data = {};
        $('#emailEdit').focus();
        $scope.login = function () {
            Auth.tryLogin({email: $scope.data.email, password: $scope.data.password}).then(function (data) {
                $state.go(settings.defaultStateAfterLogin);
                if (data.runIntro)
                    Hopscotch.runTour(750);
            }, function (msg) {
                $scope.errorInfo = settings.loginErrorInfo(msg);
            });
        };
    });
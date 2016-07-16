angular.module('Schedulogy')
    .controller("RegistrationCtrl", function ($scope, Auth, $state, settings) {
        $scope.data = {};

        $scope.register = function () {
            var postData = {email: $scope.data.email, password: $scope.data.password};
            Auth.register(postData).then(function () {
                Auth.tryLogin(postData).then(function () {
                    $state.go(settings.defaultStateAfterLogin);
                    Auth.changePushToken();
                });
            });
        };
    });
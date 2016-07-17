angular.module('Schedulogy')
    .controller('LoginCtrl', ['settings', '$scope', 'Auth', '$state', '$rootScope', '$window', '$ionicModal', function (settings, $scope, Auth, $state, $rootScope, $window, $ionicModal) {
            $scope.data = {};
            $('#emailEdit').focus();
            $scope.login = function () {
                Auth.tryLogin({email: $scope.data.email, password: $scope.data.password}).then(function () {
                    $state.go(settings.defaultStateAfterLogin);
                }, function (msg) {
                    $scope.errorInfo = settings.loginErrorInfo(msg);
                });
            };
        }]);
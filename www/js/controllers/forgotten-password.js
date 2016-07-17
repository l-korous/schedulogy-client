angular.module('Schedulogy')
    .controller('ForgottenPasswordCtrl', ['settings', '$scope', 'Auth', '$state', '$rootScope', '$window', '$ionicModal', function (settings, $scope, Auth, $state, $rootScope, $window, $ionicModal) {
            $scope.data = {};
            $('#emailEdit').focus();
            $scope.login = function () {
                Auth.sendPasswordResetLink({email: $scope.data.email}).then(function () {
                    $state.go(settings.defaultStateAfterLogin);
                }, function (msg) {
                    $scope.errorInfo = settings.loginErrorInfo(msg);
                });
            };
        }]);
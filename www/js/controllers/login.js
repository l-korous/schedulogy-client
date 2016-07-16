angular.module('Schedulogy')
    .controller('LoginCtrl', ['settings', '$scope', 'Auth', '$state', '$rootScope', '$window', '$ionicModal', function (settings, $scope, Auth, $state, $rootScope, $window, $ionicModal) {
            $scope.data = {};
            $scope.login = function () {
                Auth.tryLogin({email: $scope.data.email, password: $scope.data.password}).then(function () {
                    $state.go(settings.defaultStateAfterLogin);
                    Auth.changePushToken();
                });
            };
        }]);
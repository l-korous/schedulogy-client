angular.module('Scheduler')
        .controller('MainCtrl', function ($scope, $ionicSideMenuDelegate, $rootScope, $state) {
            $scope.toggleMenu = function () {
                $ionicSideMenuDelegate.toggleLeft();
            };
            $scope.$on('logoutCloseMenu', function () {
                $ionicSideMenuDelegate.toggleLeft(false);
            });
            $scope.disconnectedNetwork = false;
            $scope.$on('disconnectedNetwork', function () {
                $scope.disconnectedNetwork = true;
            });
            $scope.$on('connectedNetwork', function () {
                $scope.disconnectedNetwork = false;
            });
            $scope.refreshTimeSlots = function () {
                $state.go('main.calendar:callRefresh', {callRefresh: true});
            };
        });
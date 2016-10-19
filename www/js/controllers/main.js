angular.module('Schedulogy')
    .controller('MainCtrl', function ($scope, $ionicSideMenuDelegate, ModalService, MyItems, Hopscotch) {
        $scope.modalService = ModalService;
        $scope.myItems = MyItems;
        $scope.toggleMenu = function () {
            $ionicSideMenuDelegate.toggleLeft();
        };
        
        $ionicSideMenuDelegate.canDragContent(false);

        $scope.runTour = function () {
            Hopscotch.runTour(0);
        };
    });

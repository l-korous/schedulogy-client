angular.module('Schedulogy')
    .controller('MainCtrl', function ($scope, $ionicSideMenuDelegate, ModalService, MyItems, Hopscotch) {
        $scope.modalService = ModalService;
        $scope.myItems = MyItems;
        $scope.toggleMenu = function () {
            $ionicSideMenuDelegate.toggleLeft();
        };

        $scope.switchToView = function (viewType) {
            $('#theOnlyCalendar').fullCalendar('changeView', viewType);
        };

        $ionicSideMenuDelegate.canDragContent(false);

        $scope.runTour = function () {
            Hopscotch.runTour(0);
        };
    });

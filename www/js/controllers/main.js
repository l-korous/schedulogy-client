angular.module('Schedulogy')
    .controller('MainCtrl', function ($scope, settings, ModalService, MyEvents) {
        $scope.modalService = ModalService;
        $scope.myEvents = MyEvents;

        // Could this be removed?
        $scope.appVersion = settings.appVersion;
    });

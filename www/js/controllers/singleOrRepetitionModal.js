angular.module('Schedulogy')
    .controller('SingleOrRepetitionAllModalCtrl', function ($scope, MyItems, ModalService) {
        $scope.open = function () {
            ModalService.openModalInternal('singleOrRepetition');
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('singleOrRepetition', $scope, $scope.open, $scope.close);
        
        $scope.setCallback = function(callback) {
            $scope.callback = callback;
        };

        $scope.selectSingle = function () {
            $scope.callback('single');
            $scope.close();
        };

        $scope.selectRepetition = function () {
            $scope.callback('repetition');
            $scope.close();
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'singleOrRepetition')
                $scope.close();
        });

        $scope.$on('Enter', function () {
            if (ModalService.currentModal === 'singleOrRepetition')
                $scope.save();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals['singleOrRepetition'].modal.remove();
        });
    });

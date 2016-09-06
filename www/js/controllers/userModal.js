angular.module('Schedulogy')
    .controller('UserModalCtrl', function (MyUsers, $scope, settings, ModalService) {
        $scope.myUsers = MyUsers;
        $scope.loading = true;
        $scope.currentUser = null;

        $scope.open = function () {
            if (!$scope.myUsers.currentUser) {
                $scope.newUser = true;
                $scope.myUsers.emptyCurrentUser();
            }
            else
                $scope.newUser = false;
            
            $scope.currentUser = angular.extend({}, $scope.myUsers.currentUser);

            var focusPrimaryInput = function () {
                var primaryInput = $(ModalService.modals.user.modalInternal.modalEl).find('#primaryInput');
                primaryInput.focus();
                primaryInput.select();
            };

            ModalService.openModalInternal('user', focusPrimaryInput);
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        ModalService.initModal('user', $scope, $scope.open, $scope.close);

        $scope.save = function () {
            if ($scope.form.$invalid)
                return;
            angular.extend($scope.myUsers.currentUser, $scope.currentUser);
            $scope.myUsers.saveUser(function () {
                ModalService.closeModalInternal(function () {
                    ModalService.modals.users.scope.successInfo = settings.registrationSuccessInfo;
                });
            });
        };

        $scope.$on('Esc', function () {
            if (ModalService.currentModal === 'user')
                $scope.close();
        });

        $scope.$on('Enter', function () {
            if (ModalService.currentModal === 'user')
                $scope.save();
        });

        $scope.$on('$destroy', function () {
            ModalService.modals.user.modal.remove();
        });
    });
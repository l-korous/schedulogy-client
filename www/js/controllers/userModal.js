angular.module('Schedulogy')
    .controller('UserModalCtrl', function (MyUsers, $scope, settings, ModalService) {
        $scope.myUsers = MyUsers;
        $scope.loading = true;

        ModalService.createModal('user', $scope, {}, $scope.open, $scope.close);

        $scope.open = function () {
            if (!$scope.myUsers.currentUser) {
                $scope.newUser = true;
                $scope.myUsers.emptyCurrentUser();
            }
            else
                $scope.newUser = false;

            var focusPrimaryInput = function () {
                var primaryInput = $(ModalService.modals.user.modal.modalEl).find('#primaryInput');
                primaryInput.focus();
                primaryInput.select();
            };

            ModalService.openModalInternal('users', focusPrimaryInput);
        };

        $scope.close = function () {
            ModalService.closeModalInternal();
        };

        $scope.save = function () {
            if ($scope.form.$invalid)
                return;
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
angular.module('Schedulogy')
    .controller('UserModalCtrl', function (MyUsers, $scope, settings, ModalService, User) {
        $scope.myUsers = MyUsers;
        $scope.loading = true;
        $scope.currentUser = null;
        $scope.newUser = true;

        $scope.open = function () {
            $scope.errorInfo = null;

            if (!$scope.myUsers.currentUser)
                $scope.myUsers.emptyCurrentUser();

            $scope.currentUser = angular.extend(new User, $scope.myUsers.currentUser);

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
            $scope.beingSubmitted = true;
            if ($scope.form.$invalid)
                return;
            angular.extend($scope.myUsers.currentUser, $scope.currentUser);
            $scope.myUsers.saveUser(function () {
                ModalService.closeModalInternal(function () {
                    ModalService.modals.users.scope.successInfo = settings.registrationSuccessInfo;
                });
            }, function (error) {
                $scope.errorInfo = settings.registrationErrorInfo(error);
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
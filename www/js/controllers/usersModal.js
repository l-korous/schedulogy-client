angular.module('Schedulogy')
    .controller('UsersModalCtrl', function (MyUsers, $scope, $ionicModal, settings) {
        $scope.myUsers = MyUsers;
        $scope.successInfo = null;
        $scope.settings = settings;
        $scope.loading = true;

        // Register self in parent (leftMenu).
        $scope.$parent.modalScope.users = $scope;
        $scope.init = function () {
            $scope.loading = true;
            $scope.myUsers.refresh(function () {
                $scope.loading = false;
            });
        };

        $scope.closeSelf = function () {
            $scope.$parent.closeModal('users');
            $scope.successInfo = null;
        };

        $ionicModal.fromTemplateUrl('templates/userModal.html', {
            scope: $scope,
            animation: 'animated zoomIn'
        }).then(function (modal) {
            $scope.detailModal = modal;
        });

        $scope.openDetailModal = function (user) {
            if(!user) {
                $scope.newUser = true;
                $scope.myUsers.emptyCurrentUser();
            }
            else {
                $scope.myUsers.currentUser = user;
                $scope.newUser = false;
            }

            var focusPrimaryInput = function () {
                var primaryInput = $($scope.detailModal.modalEl).find('#primaryInput');
                primaryInput.focus();
                primaryInput.select();
            };

            $scope.detailModal.show().then(function () {
                focusPrimaryInput();
            });
        };

        $scope.closeDetailModal = function () {
            $scope.detailModal.hide();
        };

        $scope.myUsers.registerSaveCallback(function () {
            $scope.closeDetailModal();
            if($scope.newUser)
                $scope.successInfo = settings.registrationSuccessInfo;
        });

        $scope.$on('$destroy', function () {
            $scope.detailModal.remove();
        });
    });

angular.module('Schedulogy')
    .controller('MainCtrl', function ($scope, $rootScope, $ionicModal, Auth, settings, $http, $ionicLoading, $timeout) {
        // Some loading time to be sure we are all set.
        $scope.passwordRules = {
            minGroups: settings.minPasswordGroups,
            minLength: settings.minPasswordLength
        };

        $scope.user = {name: $rootScope.currentUser ? $rootScope.currentUser.username : ''};

        // For the calendar menu, we have to find the calendar scope.
        $timeout(function () {
            $scope.calendarScope = angular.element($('#theOnlyCalendar')).scope();
        });
        
        // Could this be removed?
        $scope.appVersion = settings.appVersion;

        $scope.modal = {};
        ['resources', 'leftMenu', 'changeUsername', 'changePassword', 'feedback'].forEach(function (modalName) {
            $ionicModal.fromTemplateUrl('templates/' + modalName + 'Modal.html', {
                scope: $scope,
                animation: modalName === 'leftMenu' ? 'animated fadeInLeft' : 'animated zoomIn'
            }).then(function (modal) {
                $scope.modal[modalName] = modal;
                // This is ugly hack, should be fixed.
                $('#primaryInput').focus();
                $('#primaryInput').select();
            });
        });

        $scope.closeModal = function (modalName) {
            $scope.modal[modalName].hide();
        };

        $scope.save = function (modalName) {
            $scope.beingSubmitted = true;
            if (modalName === 'changeUsername') {
                $ionicLoading.show({template: settings.loadingTemplate});
                Auth.changeUsername($scope.user.name).then(function () {
                    $ionicLoading.hide();
                    $scope.closeModal(modalName);
                }, function (msg) {
                    $scope.errorInfo = settings.generalErrorInfo(msg);
                });
            }
            if (modalName === 'changePassword') {
                $ionicLoading.show({template: settings.loadingTemplate});
                Auth.changePassword($scope.data.password).then(function () {
                    $ionicLoading.hide();
                    $scope.closeModal(modalName);
                }, function (msg) {
                    $scope.errorInfo = settings.generalErrorInfo(msg);
                });
            }
            if (modalName === 'feedback') {
                $ionicLoading.show({template: settings.loadingTemplate});
                $http.post(settings.serverUrl + '/msg', {msg: $scope.data.feedbackText})
                    .success(function () {
                        $ionicLoading.hide();
                        $scope.successInfo = settings.feedbackSuccessInfo;
                    })
                    .error(function (errorResponse) {
                        $ionicLoading.hide();
                        $scope.errorInfo = settings.feedbackErrorInfo(errorResponse.msg);
                    });
            }
        };

        $scope.openModal = function (modalName) {
            $scope.data = {
                feedbackText: '',
                password: '',
                confirmPassword: ''
            };
            $scope.successInfo = '';
            $scope.errorInfo = '';

            var show = $scope.modal[modalName].show();
            if (modalName !== 'leftMenu') {
                $scope.closeModal('leftMenu');
                show.then(function () {
                    if (angular.element($('#primaryInput')).scope()) {
                        angular.element($('#primaryInput')).scope().form.$setPristine();
                    }
                });
            }
        };

        $scope.$on('$destroy', function () {
            for (var modalData in ['changeUsername', 'changePassword', 'feedback'])
                $scope[modalData + 'Modal'].remove();
        });
    });

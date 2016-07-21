angular.module('Schedulogy')
    .directive('customSelect', function ($ionicGesture, $ionicModal) {
        return {
            restrict: "E",
            require: "ngModel",
            transclude: false,
            replace: false,
            priority: 1111,
            scope: {
                customSelect_optionsFunc: "&options",
                customSelect_label: "@label",
                customSelect_label2: "@label2",
                customSelect_label3: "@label3",
                customSelect_nullValue: "@nullValue",
                customSelect_cssClass: "@cssClass",
                customSelect_icon: "@icon"
            },
            link: function ($scope, element, attrs, ngModel) {
                // init modal
                $ionicModal.fromTemplateUrl("templates/popovers/select.html", {
                    scope: $scope,
                    animation: 'animated zoomIn'
                }).then(function (modal) {
                    $scope.customSelect_modal = modal;
                });

                // value checker, getter, setter
                $scope.customSelect_isValue = function (option) {
                    return ngModel.$viewValue === option;
                };
                var getValue = function (option) {
                    return attrs.hasOwnProperty("valueSelf") ? option : option[attrs.value];
                };
                $scope.customSelect_setValue = function (value) {
                    $scope.$evalAsync(function () {
                        ngModel.$setViewValue(value);
                        $scope.customSelect_modal.hide();
                    });
                };

                // init gesture
                var tapHandler = function () {
                    $scope.customSelect_modal.show();
                };
                var tapGesture = $ionicGesture.on("tap", tapHandler, element.parent());

                // watch options workaround for equality checking
                $scope.$watch($scope.customSelect_optionsFunc, function (options) {
                    $scope.customSelect_options = options;
                    var optionLost = false;
                    if (ngModel.$viewValue !== undefined) {
                        angular.forEach(options, function (option) {
                            optionLost = optionLost || ngModel.$viewValue === option;
                        });
                        optionLost || ngModel.$setViewValue();
                    }
                }, true);

                // transform external to internal value
                ngModel.$formatters.push(function (extOption) {
                    var intOption;
                    extOption !== undefined && angular.forEach($scope.customSelect_options, function (option) {
                        if (extOption === getValue(option))
                            intOption = option;
                    });
                    return intOption;
                });

                // on update handler
                var onUpdate = function () {
                    var value = ngModel.$viewValue ? ngModel.$viewValue[$scope.customSelect_label] : $scope.customSelect_nullValue;
                    if (ngModel.$viewValue && $scope.customSelect_label2) {
                        var whatToAdd = '<span class="select-option-label-2">' + ngModel.$viewValue[$scope.customSelect_label2] + '</span>';
                        if ($scope.customSelect_label3)
                            whatToAdd += '<span class="select-option-label-3">' + ngModel.$viewValue[$scope.customSelect_label3] + '</span>';

                        value += whatToAdd;
                    }
                    var icon = $scope.customSelect_icon && ngModel.$viewValue && ngModel.$viewValue[$scope.customSelect_icon] ? "<i class='icon " + ngModel.$viewValue[$scope.customSelect_icon] + "'></i> " : "";
                    element.html(icon + value);
                };

                // called on external update
                ngModel.$render = onUpdate;

                // called on internal update
                ngModel.$viewChangeListeners.push(onUpdate);

                // transform internal to external value
                ngModel.$parsers.push(function (intOption) {
                    var extOption;
                    intOption !== undefined && angular.forEach($scope.customSelect_options, function (option) {
                        if (intOption === option)
                            extOption = getValue(option);
                    });
                    return extOption;
                });

                // cleanup
                $scope.$on("$destroy", function () {
                    $ionicGesture.off(tapGesture, "tap", tapHandler);
                    $scope.customSelect_modal.remove();
                });
            }
        };
    });
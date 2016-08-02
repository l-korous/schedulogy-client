angular.module("Schedulogy")
    .directive("complexPassword", function(settings) {
        return {
            require: "ngModel",
            link: function($scope, $elem, $attrs, $ctrl) {
                $ctrl.$validators.complexity = function() {
                    var password = $ctrl.$viewValue, groups = 0;
                    /[a-z]/.test(password) && groups++;
                    /[A-Z]/.test(password) && groups++;
                    /[0-9]/.test(password) && groups++;
                    return ((groups >= settings.minPasswordGroups) && (password && (password.length >= settings.minPasswordLength)));
                };
            }
        };
    });
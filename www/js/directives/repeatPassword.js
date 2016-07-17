angular.module('Schedulogy')
    .directive('repeatPassword', function() {
        return {
            require: ['ngModel', '^form'],
            link: function($scope, $elem, $attrs, $ctrls) {
                var $thisCtrl = $ctrls[0], $otherCtrl = $ctrls[1][$attrs.repeatPassword];

                $thisCtrl.$validators.repeat = function() {
                    return !($thisCtrl.$viewValue !== $otherCtrl.$viewValue);
                };

                $otherCtrl && $otherCtrl.$viewChangeListeners.push(function() {
                    $thisCtrl.$setValidity('repeat', !($thisCtrl.$viewValue !== $otherCtrl.$viewValue));
                });
            }
        };
    });
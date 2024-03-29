angular.module('Schedulogy')
    .service('ModalService', function ($ionicModal, $rootScope) {
        var _this = this;

        // List of names of ALL modals.
        var modalNames = [
            'dirtyTasks',
            'error',
            'feedback',
            'floatToFixed',
            'help',
            'termsOfService',
            'privacyPolicy',
            'iCalUpload',
            'removeAll',
            'resource',
            'resources',
            'task',
            'event',
            'reminder',
            'tutorial',
            'switchTenant',
            'resetTenant',
            'invitation',
            'user',
            'users',
            'removeResource',
            'singleOrRepetition'
        ];

        // This is filled by the init method and the actual modals.
        // The final structure is:
        // name: {
        //      openCallback: function(),
        //      closeCallback: function(),
        //      modalInternal: ionic modal object,
        //      scope
        // }
        _this.modals = {};

        // This is actuallly not a simple reference, but rather a stack-behaving array (so that we can work with modal -> modal structure).
        _this.currentModals = [];
        // This is for ease of use the end of the array.
        _this.currentModal = null;

        // North API - init
        // MUST be called by all modals
        _this.initModal = function (modalName, scope, openCallback, closeCallback) {
            _this.modals[modalName].scope = scope;
            _this.modals[modalName].openCallback = openCallback;
            _this.modals[modalName].closeCallback = closeCallback;
        };

        // North API - open
        _this.openModal = function (modalName) {
            // Store the scroll, so that after the modal is hidden, we can re-establish the scroll.
            _this.scrollTop = $('.fc-scroller').scrollTop();

            // A workaround for the stacking problem.
            $('.modal').css('z-index', 10);
            $(_this.modals[modalName].modalInternal.modalEl).css('z-index', 11);

            $('.modal-backdrop').css('z-index', 10);
            $(_this.modals[modalName].modalInternal.modalEl.parentElement.parentElement).css('z-index', 11);

            _this.modals[modalName].openCallback();
        };

        // North API - close
        // HAS to be named this way, as just 'closeModal' is used within ionic
        _this.closeModal = function () {
            _this.modals[_this.currentModal].closeCallback();
        };

        // South API - open
        _this.openModalInternal = function (modalName, callback) {
            _this.currentModals.push(modalName);
            _this.currentModal = modalName;
            _this.modals[_this.currentModal].modalInternal.show().then(callback);
        };

        // South API - close
        // Closing with a name is only for those cases, where callbacks have to be considered.
        // - e.g.: when closing a taskModal, in some cases an errorModal has been put on top, so if we want to close
        //   the taskModal, we have to specify that we do NOT want the top modal, but this particular one.
        _this.closeModalInternal = function (modalName) {
            if (modalName) {
                _this.modals[modalName].modalInternal.hide();
                _this.currentModals.splice(_this.currentModals.indexOf(modalName), 1);
            } else {
                _this.modals[_this.currentModal].modalInternal.hide();
                _this.currentModals.pop();
            }
            if (_this.currentModals.length)
                _this.currentModal = _this.currentModals[_this.currentModals.length - 1];
            else {
                // Scroll to where I was before.
                setTimeout(function () {
                    $('.fc-scroller').scrollTop(_this.scrollTop);
                    if (!$rootScope.smallScreen)
                        $('.fc-scroller').attr("tabindex", -1).focus();
                });
            }
        };

        // Internal - create
        _this.createModal = function (modalName, customParameters) {
            var parameters = angular.extend({animation: 'animated zoomIn'}, customParameters);
            $ionicModal.fromTemplateUrl('templates/' + modalName + 'Modal.html', parameters)
                .then(function (modal) {
                    _this.modals[modalName].modalInternal = modal;
                });
        };

        // Internal - create
        _this.init = function () {
            modalNames.forEach(function (modalName) {
                _this.modals[modalName] = {};
                _this.createModal(modalName, modalName === 'leftMenu' ? {animation: 'animated fadeInLeft'} : {});
            });
        };
    });

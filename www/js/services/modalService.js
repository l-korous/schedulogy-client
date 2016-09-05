angular.module('Schedulogy')
    .service('ModalService', function ($ionicModal) {
        var _this = this;

        // List of names of ALL modals.
        var modalNames = [
            'changePassword',
            'changeUsername',
            'dirtyTasks',
            'error',
            'feedback',
            'floatToFixed',
            'help',
            'iCalUpload',
            'leftMenu',
            'removeAll',
            'resource',
            'resources',
            'task',
            'user',
            'users'
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
            _this.currentModal = modalName;
            _this.modals[modalName].modalInternal.show().then(callback);
        };

        // South API - close
        _this.closeModalInternal = function (callback) {
            _this.modals[_this.currentModal].modalInternal.hide().then(callback);
            _this.currentModal = null;
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

        _this.init();
    });

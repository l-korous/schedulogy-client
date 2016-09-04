angular.module('Schedulogy')
    .service('ModalService', function ($ionicModal) {
        var _this = this;

        // This is filled by the actual modals.
        // The structure is:
        // name: {
        //      openCallback: function(),
        //      closeCallback: function(),
        //      modalInternal: ionic modal object,
        //      scope
        // }
        _this.modals = {};

        _this.currentModal = null;

        // North API - create
        _this.createModal = function (modalName, scope, customParameters, openCallback, closeCallback) {
            var parameters = angular.extend(customParameters, {scope: scope, animation: 'animated zoomIn'});
            $ionicModal.fromTemplateUrl('templates/' + modalName + 'Modal.html', parameters)
                .then(function (modal) {
                    _this.modals[modalName] = {
                        modalInternal: modal,
                        openCallback: openCallback,
                        closeCallback: closeCallback,
                        scope: scope
                    };
                });
        };

        // North API - open
        _this.openModal = function (modalName) {
            // A workaround for the stacking problem.
            $('.modal').css('z-index', 10);
            $(_this.modals[modalName].modal.modalEl).css('z-index', 11);

            $('.modal-backdrop').css('z-index', 10);
            $(_this.modals[modalName].modal.modalEl.parentElement.parentElement).css('z-index', 11);

            _this.modals[modalName].openCallback();
        };

        // North API - close
        _this.closeModal = function () {
            _this.modals[_this.currentModal].closeCallback();
        };

        // South API - open
        _this.openModalInternal = function (modalName, callback) {
            _this.currentModal = modalName;
            _this.modal[modalName].modalInternal.show().then(callback);
        };

        // South API - close
        _this.closeModalInternal = function (callback) {
            _this.modal[_this.currentModal].modalInternal.hide().then(callback);
            _this.currentModal = null;
        };
    });

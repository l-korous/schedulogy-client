angular.module('Schedulogy')
    .service('fileUpload', function ($http) {
        this.uploadFileToUrl = function (file, uploadUrl, params, successHandler, errorHandler) {
            var fd = new FormData();
            fd.append('file', file);
            $http.post(uploadUrl, fd, {headers: angular.extend({'Content-Type': undefined}, params)})
                .success(successHandler)
                .error(errorHandler);
        };
    });
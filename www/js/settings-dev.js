angular.module('Schedulogy')
    .constant('settings', {
        serverUrl: 'http://localhost:8080/api',
        AUTH0_CLIENT_ID: 'tBP536hPoWevpGW24TLLhsnzlc8xGSn2',
        AUTH0_DOMAIN: 'schedulogy.eu.auth0.com',
        fixedBTime: {
            on: false,
            date: 'Sat Sep 03 2016 12:00:00 GMT+0200'
        },
        appVersion: '2.5.6',
    });
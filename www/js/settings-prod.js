angular.module('Schedulogy')
    .constant('settings', {
        serverUrl: 'https://www.schedulogy.com/api',
        AUTH0_CLIENT_ID: 'hq0XyOBL2u40XepMg7ZyHT4X2NsrkKt0',
        AUTH0_DOMAIN: 'schedulogy.eu.auth0.com',
        appVersion: '2.5.3',
        fixedBTime: {
            on: false,
            date: 'Sat Sep 03 2016 12:00:00 GMT+0200'
        }
    });
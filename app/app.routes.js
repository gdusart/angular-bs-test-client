/*global angular*/

angular.module("mainApp").config(function($routeProvider, USER_ROLES) {
    $routeProvider
        .when('/login', {
            templateUrl: 'login-form.html',
            controller: 'loginController',
            data: {authorizedRoles:[]} 
        })
        .when('/home', {
            templateUrl: 'app/views/servers/list.html',
            controller: 'serversController',
            data: {authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]}
        })
        .when('/server/edit', {
            templateUrl: 'app/views/servers/edit.html',
            controller: 'serversController'
        })
        .otherwise({
            redirectTo: '/home'
        });
});
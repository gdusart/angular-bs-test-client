/*global angular*/

var app = angular.module("mainApp", ['ngRoute','smart-table']);

 
app.config(function($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'servers.html',
            controller: 'serversController'
        })
        .otherwise({
            redirectTo: '/home'
        });
});
 
app.controller('serversController', function($scope, $http) {
    
     $http.get("https://node-gdusart.c9users.io:8081/servers/list")
        .then(function(response){ $scope.servers = response.data; });
    
 
    $scope.message = "List of servers";
});
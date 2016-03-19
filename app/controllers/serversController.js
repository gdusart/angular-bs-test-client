/*global angular*/

angular.module('mainApp').controller('serversController',
    function($scope, $http, ServerResource) {
    
    $scope.refresh = function () {
        $scope.servers = ServerResource.query();
    };
    
    $scope.delete = function( id ) {
        ServerResource.delete({id: id});
        $scope.refresh();
   };
   

    
    // load data
    $scope.refresh();
    

});
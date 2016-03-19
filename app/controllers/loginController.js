/* global angular */

angular.module('mainApp').controller('loginController',
    function($scope, $rootScope, AUTH_EVENTS, AuthService, $log, $location) {

        $scope.credentials = {
            username: '',
            password: ''
        };

        $scope.login = function(credentials) {
            $log.debug("Login")
            AuthService.login(credentials).then(function(user) {
                $log.debug("login success")
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                $scope.setCurrentUser(user);
                $location.path('/home')
            }, function() {
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            });
        };
        
    });
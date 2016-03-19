/*global angular*/

var app = angular.module("mainApp", ['ngRoute', 'smart-table', 'ngResource']);

var baseRestUrl = 'https://node-gdusart.c9users.io:8081';

app.factory('ServerResource', function($resource) {
    return $resource(baseRestUrl + '/servers/:id');
});

app.factory('LoginResource', function($resource) {
    return $resource(baseRestUrl + '/login');
});


// Authentication constants
app.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
});

app.constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    editor: 'editor',
    guest: 'guest'
});

// Service to store, create and destroy session object
app.service('Session', function ($log) {
  this.create = function (sessionId, userId, userRole) {
    $log.debug('session create %s %s %s', sessionId, userId, userRole);
    this.id = sessionId;
    this.userId = userId;
    this.userRole = userRole;
  };
  this.destroy = function () {
    this.id = null;
    this.userId = null;
    this.userRole = null;
  };
});



// Authentication service
app.factory('AuthService', function($http, Session, LoginResource, $log) {
    var authService = {};

    authService.login = function(credentials, cb) {
        return LoginResource.save({login: credentials.login, password:credentials.password},
              function(session) {
                  Session.create(session.id, session.user.name, session.user.role);
                  return session.user;
              }
        ).$promise;
    };

    authService.isAuthenticated = function() {
        return !!Session.userId;
    };

    authService.isAuthorized = function(authorizedRoles) {
       $log.debug('session role : %s', Session.userRole);
        if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
        }
        return (authService.isAuthenticated() &&
            authorizedRoles.indexOf(Session.userRole) !== -1);
    };

    return authService;
});

app.controller('ApplicationController', function ($scope,  USER_ROLES,  AuthService, $log) {
  $scope.currentUser = null;
  $scope.userRoles = USER_ROLES;
  $scope.isAuthorized = AuthService.isAuthorized;
 
  $scope.setCurrentUser = function (user) {
    $scope.currentUser = user;
  };
  
  $scope.isLoggedIn = function () {
    $log.debug('isLoggedIn? %s:', AuthService.isAuthenticated());
    return AuthService.isAuthenticated();
  }
});

app.run(function ($rootScope, AUTH_EVENTS, AuthService, $log) {
  $rootScope.$on('$routeChangeStart', function (event, next) {
    var authorizedRoles = next.data.authorizedRoles;
    
    $log.debug('autorized roles : %s', next.data.authorizedRoles)
    if (!AuthService.isAuthorized(authorizedRoles)) {
       $log.debug("not authorized");
      event.preventDefault();
      if (AuthService.isAuthenticated()) {
        // user is not allowed
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      } else {
        // user is not logged in
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      }
    }
  });
});

// return appropriate errors codes related to authentication
app.config(function ($httpProvider) {
  $httpProvider.interceptors.push([
    '$injector',
    function ($injector) {
      return $injector.get('AuthInterceptor');
    }
  ]);
});

app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) { 
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized,
        419: AUTH_EVENTS.sessionTimeout,
        440: AUTH_EVENTS.sessionTimeout
      }[response.status], response);
      return $q.reject(response);
    }
  };
})

// show login dialog
app.directive('loginDialog', function (AUTH_EVENTS) {
  return {
    restrict: 'A',
    template: '<div ng-if="visible" ng-include="\'login-form.html\'">',
    link: function (scope) {
      var showDialog = function () {
        scope.visible = true;
      };
  
      scope.visible = false;
      scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
      scope.$on(AUTH_EVENTS.sessionTimeout, showDialog)
    }
  };
});

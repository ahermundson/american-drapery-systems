var app = angular.module('app', ['ngRoute', 'firebase', 'ngMaterial']);



app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .when('/login', {
    templateUrl: '/views/templates/login.html',
    controller: 'LoginController',
    controllerAs: 'login'
  })
  .when('/dashboard', {
    templateUrl: '/views/templates/dashboard.html',
    controller: 'DashboardController',
    controllerAs: 'dash'
  })
  .when('/measurement', {
    templateUrl: '/views/templates/measurement.html',
    controller: 'MeasurementController',
    controllerAs: 'measure'
  })
  .when('/survey', {
    templateUrl: '/views/templates/survey.html',
    controller: 'SurveyController',
    controllerAs: 'survey'
  })
  .when('/profile' ,{
    templateUrl: '/views/templates/profile.html',
    controller: 'ProfileController',
    controllerAs: 'profile'
  })
  .when('/files', {
    templateUrl: '/views/templates/files.html',
    controller: 'FileController',
    controllerAs: 'files'
  })
  .when('/area' ,{
    templateUrl: '/views/templates/measurement-area.html',
    controller: 'MeasurementAreaController',
    controllerAs: 'ma'
  })
  .otherwise({
    redirectTo: 'login'
  });

}]);

app.filter('startFrom', function() {
  return function(input, start) {
    start = +start; //parse to int
    return input.slice(start);
  }
});

function formatDates(aryOfObjs){
  //convert the ISO Dates to readable format
  // aryOfObjs.map(function(obj){
  //   if(moment(obj).isValid){
  //     return moment(obj).format("YYYY/MM/DD");
  //   }
  // });
  for (var i = 0; i < aryOfObjs.length; i++) {
    if(moment(aryOfObjs[i].last_modified).isValid()) {
      aryOfObjs[i].last_modified = moment(aryOfObjs[i].last_modified).format("YYYY/MM/DD");
    }
    if(moment(aryOfObjs[i].survey_date).isValid()) {
      aryOfObjs[i].survey_date = moment(aryOfObjs[i].survey_date).format("YYYY/MM/DD");
    }
    console.log('valid', moment(aryOfObjs[i].completion_date).isValid(), aryOfObjs[i].completion_date);
    if(moment(aryOfObjs[i].completion_date).isValid()) {
      console.log('moment');
      aryOfObjs[i].completion_date = moment(aryOfObjs[i].completion_date).format("YYYY/MM/DD");
    }
  }
  return aryOfObjs;
}

app.controller('SurveyController', ["$http", 'UserFactory', 'IdFactory', '$route', 'FileFactory', '$scope', '$mdDialog',
function($http, UserFactory, IdFactory, $route, FileFactory, $scope, $mdDialog) {
  var self = this;
  var surveyId = $route.current.params.surveyId;
  self.surveyId = surveyId;
  var currentUser;
  self.loading = false;
  self.imgLoad = false;
  const MIN_AREA_GOTO_TOP = 3;
  var currentFilesObject = {};
  self.goToTop = function() {
    window.scrollTo(0, 0);
  };

  self.show = true;
  self.baseUrl = 'https://s3.amazonaws.com/american-drapery-systems/survey_' + surveyId + '/area_';

  self.showPreview = function(ev, index) {
    // Appending dialog to document.body to cover sidenav in docs app
    var currentFile = self.currentFilesObject["file_" + (index + 1)];
    var currentFileUrl = self.baseUrl + currentFile.areaId + '/' + currentFile.key + currentFile.originalName;

    if(currentFile.extension == "pdf") {
      $mdDialog.show({
        template:
          '<md-card>' +
            '<md-card-content layout="row" layout-wrap>' +
              '<iframe ng-src="' + currentFileUrl + '" width="750" height="750"></iframe>' +
            '</md-card-content>' +
          '</md-card flex>',
        targetEvent: ev,
        clickOutsideToClose: true
      })
    } else {
      $mdDialog.show({
        template:
          '<md-card>' +
            '<md-card-content layout="row" layout-wrap>' +
              '<img ng-src="' + currentFileUrl + '"/>' +
            '</md-card-content>' +
          '</md-card flex>',
        targetEvent: ev,
        clickOutsideToClose: true
      })
    }
  };



  function getSurveyDetails() {
    // currentUser = UserFactory.getUser();
    // console.log("Current User", currentUser);
    currentUser.getToken()
    .then(function(idToken) {
        $http({
          method: 'GET',
          url: '/surveys/preview/one/' + surveyId,
          headers: {
            id_token: idToken
          }
        })
        .then(function(response){
          self.surveyDetails = formatDates(response.data);
          //Seperate measurements into areas
          var separateAreas = groupBy(self.surveyDetails, 'area_name');
          self.areaArray = [];
          self.loading = true;
          for (x in separateAreas) {
            self.areaArray.push(separateAreas[x]);
          }
        })
        .then(function() {
          FileFactory.getSurveyFiles(currentUser, surveyId)
            .then(function() {
              self.currentFilesObject = FileFactory.currentFilesObject;
              FileFactory.currentFilesObject = {}; //Clearfile Factory
              self.imgLoad = true;
              $scope.$apply();
            })
        })
        .catch(function(err) {
          console.log("error getting survey details: ", err);
        })
    })
  };

  UserFactory.auth.$onAuthStateChanged(function(firebaseUser) {
    currentUser = firebaseUser;
    getSurveyDetails();
  });

  self.printPage = function() {
    window.print();
  }

}]);//end controller

//Function to group measurements by area
function groupBy(arr, property) {
  return arr.reduce(function(memo, x) {
    if (!memo[x[property]]) { memo[x[property]] = []; }
    memo[x[property]].push(x);
    return memo;
  }, {});
}

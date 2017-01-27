app.controller('MeasurementAreaController', ["$http", '$location', 'UserFactory', '$route', '$mdDialog', '$timeout',
function($http, $location, UserFactory, $route, $mdDialog, $timeout) {
  var self = this;
  // var survey_id = IdFactory.getSurveyId();
  var surveyId = $route.current.params.surveyId;
  self.loading = false;
  self.showInput = false
  self.companyInfo = {};
  var currentUser;
  var areaId;
  var selectedAreaName;
  var surveyHasAreas = true;
  self.newAreaName = '';
  self.editAreas = false;

  self.inputAreaName = false;
  self.toRemove = [];
  self.loggedOut = false;

  //function to send area to measurent controller
  self.setArea = function(index) {
    areaId = self.areaArrayId[index];
    selectedAreaName = self.areaArray[index];

    $location.path('/measurement/' + surveyId + '/' + areaId + '/' + selectedAreaName);
  }


  //function to add a new area
  self.showInput = function() {
    self.inputAreaName = true;
  }
  self.showConfirm = function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
    if(self.toRemove.indexOf(true) != -1) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you wish to delete the selected areas and all associated measurements and files')
        .targetEvent(ev)
        .ok('Yes. Delete areas.')
        .cancel('No. Go back to areas');
      $mdDialog.show(confirm).then(function() {
        deleteAreas();
      }, function() {
      });
    }
  };

  self.areaClick = function(index) {
    if(self.editAreas) {
      self.toRemove[index]=!self.toRemove[index];
    } else {
      self.setArea(index);
      self.editAreas = true;
    }
  }
  function deleteAreas() {
    self.loading = false;
    var deleteIds = [];
    // var currentUser = UserFactory.getUser();
    for (var i = 0; i < self.toRemove.length; i++) {
      if (self.toRemove[i]) {
        deleteIds.push(self.areaArrayId[i])
      }
    }
    currentUser.getToken()
      .then(function(idToken) {
        $http({
          method: 'DELETE',
          url: '/areas/',
          params: {
            "id[]": deleteIds
          },
          headers: {
            id_token: idToken
          }
        }).then(function(response){
          //get survey details on last iteration
          getSurveyDetails();
          console.log('deletes complete')
        },
        function(err) {
          console.log("error with delete: ", err);
    });
    });
  }

  self.addNewArea = function() {
    if(self.newAreaName == '') {
      $mdDialog.show({
        template:
          '<md-card>' +
            '<md-card-content layout="row" layout-wrap>' +
              '<b>You must add an Area Name</b>' +
            '</md-card-content>' +
          '</md-card flex>',
        // targetEvent: ev,
        clickOutsideToClose: true
      })
    } else {
      self.loading = false;
      self.inputAreaName = false;
      self.newArea = {
        area_name: self.newAreaName,
        survey_id: surveyId,
        notes: ""
      }

      currentUser.getToken()
        .then(function(idToken) {
          $http({
            method: 'POST',
            url: '/areas/',
            data: self.newArea,
            headers: {
              id_token: idToken
            }
          }).then(function(response){
            console.log("Response from new area post: ", response.data[0].id);
            areaId = response.data[0].id;
            $location.path('/measurement/' + surveyId + '/' + areaId + '/' + self.newAreaName);
          },
          function(err) {
            console.log("error getting survey details: ", err);
            if (err.status === 403) {
              notAuthorizedAlert();
              console.log("In error 403");
            }
          });
      })
    }
  }

  //Edit client profile button
  self.editClient = function(){
    self.showInput = !self.showInput;
  }
  //save edits to client profile button
  self.updateClient = function(){
    var clientId = self.companyInfo.client_id;
    currentUser.getToken()
    .then(function(idToken) {
      $http({
        method: 'POST',
        url: '/clients/'+ clientId,
        data: self.companyInfo,
        headers: {
          id_token: idToken
        }
      }).then(function(response){
        self.showInput = !self.showInput;
      },
      function(err) {
        console.log("error updating clientdetails: ", err);
        if (err.status === 403) {
          notAuthorizedAlert();
          console.log("In error 403");
        }
      });
    });

    currentUser.getToken()
    .then(function(idToken) {
      $http({
        method: 'PUT',
        url: '/surveys/update/'+ surveyId,
        data: self.companyInfo,
        headers: {
          id_token: idToken
        }
      }).then(function(response){
      },
      function(err) {
        console.log("error updating clientdetails: ", err);
        if (err.status === 403) {
          notAuthorizedAlert();
          console.log("In error 403");
        }
      });
    });
  }
  //function to handle clicking of an already existing area

  //function to get all areas associated with survey or just company and survey information if the survey is new
  function getSurveyDetails(firebaseUser) {
    currentUser.getToken()
      .then(function(idToken) {
        $http({
          method: 'GET',
          url: '/surveys/one/' + surveyId,
          headers: {
            id_token: idToken
          }
        })
        .then(function(response){
          self.surveyDetails = response.data;
          //Check to see if it is a new survey. Length will be zero if it is a new survey
          if (self.surveyDetails.length === 0) {
            surveyHasAreas = false;
            console.log('no areas');
            currentUser.getToken()
              .then(function(idToken) {
                $http({
                  method: 'GET',
                  url: '/surveys/new/' + surveyId,
                  headers: {
                    id_token: idToken
                  }
                })
                .then(function(response){
                  self.surveyDetails = response.data;
                  surveyOps();
                },
                function(err) {
                  console.log("error getting survey details: ", err);
                });
            });
          } else {
            surveyOps();
          }
        },
        function(err) {
          console.log("error getting survey details: ", err);
        });
    });
  }

  function surveyOps() {

    self.companyInfo = self.surveyDetails[0];
    if(surveyHasAreas) {
      self.areaArray = [...new Set(self.surveyDetails.map(survey => survey.area_name))];
      self.areaArrayId = [...new Set(self.surveyDetails.map(survey => survey.id))];
      for (var i = 0; i < self.areaArray.length; i++) {
        self.toRemove[i] = false;
      }
    } else {
      self.areaArray = [];
      self.areaArrayId = [];
    }
    if (self.companyInfo.completion_date) {
      self.completionDate = new Date(self.companyInfo.completion_date);
    }
    if (self.companyInfo.survey_date) {
      self.surveyDate = new Date(self.companyInfo.survey_date);
    }
    self.editAreas = false;
    self.loading = true;
    surveyHasAreas = true;
  }
  // getSurveyDetails(firebaseUser);
  //This happens when when we switch to this view/controller AND when page is refreshed
  UserFactory.auth.$onAuthStateChanged(function(firebaseUser) {
    if (firebaseUser) {
      currentUser = firebaseUser;
      getSurveyDetails(firebaseUser);
    } else {
      console.log("No User");
      self.loggedOut = true;
      $timeout(function() {
        $location.path('/login');
      }, 3000);
    }
  });

  self.survey = function() {
    self.loading = true;
    $location.path('/survey/' + surveyId);
  }

  function notAuthorizedAlert() {
      alert = $mdDialog.alert({
        title: 'Attention',
        textContent: 'You are not authorized to perform this action',
        ok: 'Close'
      });

      $mdDialog
        .show( alert )
        .finally(function() {
          alert = undefined;
        });
    }

}]);

//Function to group measurements by area
function groupBy(arr, property) {
  return arr.reduce(function(memo, x) {
    if (!memo[x[property]]) { memo[x[property]] = []; }
    memo[x[property]].push(x);
    return memo;
  }, {});
}

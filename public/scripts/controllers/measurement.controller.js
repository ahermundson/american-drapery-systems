app.controller('MeasurementController', ["$http", "UserFactory",
"$mdDialog", '$route', '$location', '$anchorScroll', '$timeout',
function($http, UserFactory, $mdDialog, $route, $location, $anchorScroll, $timeout) {
  var self = this;
  var surveyId = $route.current.params.surveyId;
  self.measurement = {};
  self.measurements =[];
  self.measurement.edit = true;
  self.areaId = $route.current.params.areaId;
  self.area_name = $route.current.params.areaName;
  self.loading = false;
  self.showInput = true;
  self.addColor = 0;
  self.deleteColor = 0;
  self.currentProfile = {};
  var currentUser;

  //Runs when page refreshed AND when switching to this controller
  UserFactory.auth.$onAuthStateChanged(function(firebaseUser) {
    if(firebaseUser) {
      currentUser = firebaseUser;
      getMeasurements(firebaseUser);
      getAreaInfo(firebaseUser);
    } else {
      console.log("There is no firebase user in measurement controller");
    }
  });

  function getMeasurements(firebaseUser) {
    currentUser = firebaseUser;
    currentUser.getToken()
      .then(function(idToken) {
        $http({
          method: 'GET',
          url: '/measurements/' + self.areaId,
          headers: {
            id_token: idToken
          }
        }).then(function(response) {
          console.log("response in measurement controller: ", response);
          self.measurements = response.data;
          initMeas();
        }).catch(function(err) {
          console.log("Error in measurment controller get req: ", err);
        });
      })
  }

  function getAreaInfo(firebaseUser) {
    currentUser = firebaseUser;
    currentUser.getToken()
      .then(function(idToken) {
        $http({
          method: 'GET',
          url: '/areas/' + self.areaId,
          headers: {
            id_token: idToken
          }
        })
        .then(function(response){
          self.companyInfo = response.data[0];
          initArea();
        },
        function(err) {
          console.log("error getting survey details: ", err);
        });
    })
  }

  function initMeas() {
    for (var i = 0; i < self.measurements.length; i++) {
      self.measurements[i].edit = true;
    }
    self.loading = true;
  }

  function initArea() {
    self.areaNotes = self.companyInfo.notes;
    if (self.companyInfo.completion_date) {
      self.completionDate = new Date(self.companyInfo.completion_date);
    }
    if (self.companyInfo.survey_date) {
      self.surveyDate = new Date(self.companyInfo.survey_date);
    }
  }

  self.addButton = function(){
    self.deleteColor = 0;
    var currentUser = UserFactory.getUser();
    currentUser.getToken()
    .then(function(idToken) {
      $http({
        method: 'POST',
        url: '/measurements/' + self.areaId,
        data: self.measurement,
        headers: {
          id_token: idToken
        }
      }).then(function(response) {
        addOps(response.data[0].id);
      }).catch(function(err) {
        console.log("Error in measurement post");
        if (err.status === 403) {
          notAuthorizedAlert();
        }
      });
    })
  }

  function addOps(newId) {
    self.measurement.id = newId;
    self.addColor = newId;
    self.measurements.push(angular.copy(self.measurement));
    $timeout(function(){
      self.addColor = 0;
    }, 700);
  }

  function updateNotes(){
    currentUser.getToken()
      .then(function(idToken) {
        $http({
          method: 'PUT',
          url: '/areas/notes/' + self.areaId,
          data: {note: self.areaNotes},
          headers: {
            id_token: idToken
          }
        }).then(function(response){},
        function(err) {
          console.log("error updating survey details: ", err);
          if (err.status === 403) {
            notAuthorizedAlert();
          }
        });
    });
  }

  //button clicked to update the edited row
  self.updateRowButton = function(index){

    self.measurements[index].edit = !self.measurements[index].edit;
    var currentUser = UserFactory.getUser();
    currentUser.getToken()
      .then(function(idToken) {
          $http({
            method: 'PUT',
            url: '/measurements/',
            data: self.measurements[index],
            headers: {
              id_token: idToken
            }
          }).then(function(response) {
          }).catch(function(err) {
            console.log("Error in measurement update");
            //replace with previous values
            getMeasurements();
            if (err.status === 403) {
              notAuthorizedAlert();
            }
          });
      });
  }

  //Confirming user wants to delete measurement. Index is the measurement to delete
  self.showConfirm = function(ev, index, id) {
    // Appending dialog to document.body to cover sidenav in docs app
    self.deleteColor = id;
    var confirm = $mdDialog.confirm()
      .title('Are you sure you wish to delete this measurement?')
      .targetEvent(ev)
      .ok('Yes. Delete measurement.')
      .cancel('No. Go back to measurements');
    $mdDialog.show(confirm).then(function() {
      deleteRow(index);
    }, function() {
      self.deleteColor = 0;
    });
  };
  //Deleting measurement after confirmation
  function deleteRow(index){
    currentUser = UserFactory.getUser();
    currentUser.getToken()
    .then(function(idToken) {
      $http({
        method: 'DELETE',
        url: '/measurements/' + self.measurements[index].id,
        headers: {
          id_token: idToken
        }
      }).then(function(response) {
        self.measurements.splice(index, 1);
        self.deleteColor = 0;
        self.deleteId = null;
      }).catch(function(err) {
        console.log("Error in measurement post");
        if (err.status === 403) {
          notAuthorizedAlert();
        }
      });
    });
  }

  self.backToArea = function() {
    updateNotes();
    $location.path('/area/' + surveyId);
  }

  self.goToTopOfPage = function(){
    window.scrollTo(0,0);
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
        self.deleteColor = 0;
        self.deleteId = null;
        alert = undefined;
        getMeasurements(currentUser);
        self.measurement = {};
      });
  }

}]);

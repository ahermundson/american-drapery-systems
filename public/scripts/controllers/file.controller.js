/**********************
Create file controller
***********************/
app.controller('FileController', ['FileFactory', 'UserFactory', 'IdFactory', '$route', '$mdDialog', '$scope', '$mdToast', '$http',
function(FileFactory, UserFactory, IdFactory, $route, $mdDialog, $scope, $mdToast, $http) {
  console.log("File controller running");
  const self = this;

  var currentUser;
  var surveyId = $route.current.params.surveyId;
  var areaId = $route.current.params.areaId;

  UserFactory.auth.$onAuthStateChanged(function(firebaseUser) {
    if(firebaseUser) {
      currentUser = firebaseUser;
      FileFactory.currentFilesObject = {}; //clear filesObject in factory
      FileFactory.getFiles(currentUser, areaId)
        .then(function() {
          self.currentFilesObject = FileFactory.currentFilesObject;
          console.log(self.currentFilesObject);
      });
    } else {
      console.log("There is no firebase user in file controller");
    }
  });

  self.newFilesObject = { //store files and info here
    files: FileList,
    filesInfo: {}
  };

  self.currentFilesObject = {};

  self.showPreview = function(ev, index) {
    // Appending dialog to document.body to cover sidenav in docs app
    var currentFile = self.currentFilesObject["file_" + (index + 1)];
    var baseUrl = 'https://s3.amazonaws.com/american-drapery-systems/survey_';
    var currentFileUrl = baseUrl + surveyId + '/' + 'area_' + currentFile.areaId + '/' + currentFile.key + currentFile.originalName;

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

  self.submitFiles = function() {
    FileFactory.updateFiles(self.newFilesObject); //send newFilesObject to FileFactory
    FileFactory.submitFiles(currentUser, surveyId, areaId)
    .then(function() {
      FileFactory.getFiles(currentUser, areaId)
        .then(function() {
          self.currentFilesObject = FileFactory.currentFilesObject;
          self.newFilesObject = {
            files: FileList,
            filesInfo: {}
          };
          console.log(self.newFilesObject);
          $scope.$apply();
        })
    }); //send files and info to server
  };

  self.deleteFile = function(index) {
    var clickedFile =  self.currentFilesObject["file_" + (index + 1)];
    currentUser.getToken()
      .then(function(idToken) {
        $http({
          method: 'DELETE',
          url: '/files/' + surveyId + '/' + clickedFile.areaId + '/' + clickedFile.key + '/' + clickedFile.originalName,
          headers: {
            id_token: idToken
          }
        }).then(function(response) {
          FileFactory.currentFilesObject = {}; //clear fileFactory
          FileFactory.getFiles(currentUser, areaId)
            .then(function() {
              self.currentFilesObject = FileFactory.currentFilesObject;
              $scope.$apply();
        }).catch(function(err) {
          console.log("Server error deleting files: ", err);
          FileFactory.getFiles(currentUser, areaId)
            .then(function() {
              self.currentFilesObject = FileFactory.currentFilesObject;
            })
          })
        })

      })
  };

}]);//End controller

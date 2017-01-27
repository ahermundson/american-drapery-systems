/**********************
Create file factory
***********************/
app.factory('FileFactory', ['$http', 'MultipartForm',
function($http, MultipartForm) {

  var fileFactory = {

    newFilesObject: {
      files: FileList,
      filesInfo: {}
    },

    currentFilesObject: {},

    updateFiles: function(newFiles) {
      fileFactory.newFilesObject.files = newFiles.files;
      fileFactory.newFilesObject.filesInfo = newFiles.filesInfo;
    },

    getFiles: function(currentUser, areaId) {
      return currentUser.getToken().then(function(idToken) {
        return $http({
          method: 'GET',
          url: '/files/' + areaId,
          headers: {
            id_token: idToken
          }
        }).then(function(response) {
          // return console.log("Recieved this info from the server in FileFactory GET req: ", response);\
          for (var i = 0; i < response.data.length; i++) {
            let currentFile = response.data[i];
            //create file property(subobject):
            fileFactory.currentFilesObject["file_" + (i + 1)] = {};
            //add data to file property subobject:
            fileFactory.currentFilesObject["file_" + (i + 1)].areaId = currentFile.area_id;
            fileFactory.currentFilesObject["file_" + (i + 1)].bucket = currentFile.bucket;
            fileFactory.currentFilesObject["file_" + (i + 1)].fileInfo = currentFile.file_info;
            fileFactory.currentFilesObject["file_" + (i + 1)].id = currentFile.id;
            fileFactory.currentFilesObject["file_" + (i + 1)].key = currentFile.key;
            fileFactory.currentFilesObject["file_" + (i + 1)].originalName = currentFile.original_name;
            fileFactory.currentFilesObject["file_" + (i + 1)].extension = currentFile.original_name.slice((Math.max(0, currentFile.original_name.lastIndexOf(".")) || Infinity) + 1);
          }
          return fileFactory.currentFilesObject;
        })
      })
    },

    getSurveyFiles: function(currentUser, surveyId) {
      console.log("current user in get files: ", currentUser);
      return currentUser.getToken().then(function(idToken) {
        return $http({
          method: 'GET',
          url: '/files/survey/' + surveyId,
          headers: {
            id_token: idToken
          }
        }).then(function(response) {
          // return console.log("Recieved this info from the server in FileFactory GET req: ", response);\
          for (var i = 0; i < response.data.length; i++) {
            let currentFile = response.data[i];
            //create file property(subobject):
            fileFactory.currentFilesObject["file_" + (i + 1)] = {};
            //add data to file property subobject:
            fileFactory.currentFilesObject["file_" + (i + 1)].areaId = currentFile.area_id;
            fileFactory.currentFilesObject["file_" + (i + 1)].bucket = currentFile.bucket;
            fileFactory.currentFilesObject["file_" + (i + 1)].fileInfo = currentFile.file_info;
            fileFactory.currentFilesObject["file_" + (i + 1)].id = currentFile.id;
            fileFactory.currentFilesObject["file_" + (i + 1)].key = currentFile.key;
            fileFactory.currentFilesObject["file_" + (i + 1)].originalName = currentFile.original_name;
            fileFactory.currentFilesObject["file_" + (i + 1)].extension = currentFile.original_name.slice((Math.max(0, currentFile.original_name.lastIndexOf(".")) || Infinity) + 1);
            if(fileFactory.currentFilesObject["file_" + (i + 1)].extension == 'pdf') {
              fileFactory.currentFilesObject["file_" + (i + 1)].print = false;
            } else {
              fileFactory.currentFilesObject["file_" + (i + 1)].print = true;
            }
          }
          return fileFactory.currentFilesObject;
        })
      })
    },

    submitFiles: function(currentUser, surveyId, areaId) {
      var uploadUrl = '/files/' + areaId;
      return currentUser.getToken().then(function(idToken) {
        return MultipartForm.post(uploadUrl, surveyId, fileFactory.newFilesObject, idToken)
        .then(function(response) {
          return console.log("Response from server: ", response);
        });
      });
    }
  }
  return fileFactory;
}]);

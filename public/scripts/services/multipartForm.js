app.service('MultipartForm', ['$http', function($http) {
  this.post = function(uploadUrl, surveyId, data, idToken) {
    var fd = new FormData(); //We will store form data here to be sent to server
    //Loop through fileInfo object and append each info property to fd
    for (var file in data.filesInfo) {
      if (data.filesInfo.hasOwnProperty(file)) {
        fd.append(file, data.filesInfo[file]);
      }
    }
    //Loop through FileList and add each file to fd
    for( var i = 0; i< data.files.length ; i++ ){
        fd.append('file' , data.files[i] );
    }
    return $http.post(uploadUrl, fd, { //this is a configuration for the POST
      transformRequest: angular.indentity, //stops angular from serializing our data
      headers: {
        'Content-Type': undefined, //lets browser handle what type of data is being sent...
        id_Token: idToken,
        survey_id: surveyId
      }
    });
  };//end this.post
}]);

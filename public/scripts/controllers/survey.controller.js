app.controller('SurveyController', ["$http", function($http) {
  var self = this;
  var survey_id = 2;

  function getSurveyDetails() {
    $http({
      method: 'GET',
      url: '/surveys/one/' + survey_id
    }).then(function(response){
      self.surveyDetails = response;
      console.log("Response From Server: ", self.surveyDetails.data);

      //Assigning Contact Information to variables in controller
      self.primary_contact_name = self.surveyDetails.data[0].primary_contact_name;
      self.primary_contact_phone_number = self.surveyDetails.data[0].primary_contact_phone_number;
      self.primary_contact_email = self.surveyDetails.data[0].primary_contact_email;

      //Only show alt contact if one exists
      if (self.surveyDetails.data[0].alt_contact_name !== null) {
        self.showAltContact = true;
        self.alt_contact_name = self.surveyDetails.data[0].alt_contact_name;
        self.alt_phone_number = self.surveyDetails.data[0].alt_phone_number;
        self.alt_contact_email = self.surveyDetails.data[0].alt_contact_email;
      } else {
        self.showAltContact = false;
      }

      //Seperate measurements into areas
      var separateAreas = groupBy(self.surveyDetails.data, 'area');
      console.log(separateAreas);
      self.areaArray = [];
      for (x in separateAreas) {
        self.areaArray.push(separateAreas[x]);
      }
    },
    function(err) {
      console.log("error getting survey details: ", err);
    });
  }

  getSurveyDetails();
}]);

//Function to group measurements by area
function groupBy(arr, property) {
  return arr.reduce(function(memo, x) {
    if (!memo[x[property]]) { memo[x[property]] = []; }
    memo[x[property]].push(x);
    return memo;
  }, {});
}

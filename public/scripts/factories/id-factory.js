app.factory("IdFactory", function($interval)
{
  var id={
    survey: 0,
    area: 0,
    measurement: 0,
    client: 0,
    newArea: false,
    newSurvey: false
  };
  return {
    id: id,
    setSurvey: function(newId) {
      console.log('changing survey to ', newId);
      id.survey = newId;
    },
    setArea: function(newId) {
      console.log('changing survey to ', newId);
      id.area = newId;
    },
    setMeasurement: function(newId) {
      console.log('changing survey to ', newId);
      id.measurement = newId;
    },
    setClient: function(newId) {
      console.log('changing survey to ', newId);
      id.client = newId;
    },
    getSurveyId: function() {
      return id.survey;
    },
    getAreaId: function() {
      return id.area;
    },
    setNewSurvey: function(name) {
      id.newSurvey = name;
    },
    setNewArea: function(name) {
      id.newArea = name;
    },
    getNewArea: function() {
      var tmp = id.newArea;
      id.newArea = false;
      return tmp;
    },
    getNewSurvey: function() {
      var tmp = id.newMeasurement;
      id.newMeasurement = false;
      return tmp;
    }
  }
});

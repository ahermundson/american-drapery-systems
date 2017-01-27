app.factory("IdFactory", function($interval)
{
  var id={
    survey: 0,
    area: 0,
    measurement: 0,
    client: 0,
    newAreaName: '',
    newArea: false,
    newSurvey: false
  };
  return {
    id: id,
    setSurvey: function(newId) {
      id.survey = newId;
    },
    setArea: function(newId) {
      id.area = newId;
    },
    setMeasurement: function(newId) {
      id.measurement = newId;
    },
    setClient: function(newId) {
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
    setNewAreaName: function(name) {
      id.newAreaName = name;
      id.newArea = true;
    },
    getNewArea: function() {
      id.newArea = false;
      return id.newAreaName;
    },
    getNewSurvey: function() {
      var tmp = id.newMeasurement;
      id.newMeasurement = false;
      return tmp;
    }
  }
});

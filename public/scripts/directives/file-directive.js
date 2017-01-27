/*********************
Create file directive
**********************/
app.directive('fileModel', ['$parse', function($parse) {
  return {
    restrict: 'A',//restrict to attribute
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;
      element.bind('change', function() { //when element changes, execute this function
        scope.$apply(function() {
          modelSetter(scope, element[0].files);
        });
      });
    }
  };
}]);//end directive

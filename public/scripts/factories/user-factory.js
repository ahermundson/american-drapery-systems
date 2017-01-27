/******************
Create UserFactory
*******************/
app.factory('UserFactory', ['$firebaseAuth', "$http",
function($firebaseAuth, $http) {
  //Auth is constant (won't change), assign to $firebaseAuth()
  const auth = $firebaseAuth();
  //Instantiate currentUser object
  var currentUser;
  var isUser = false;
  //logIn fxn, called when logIn button clicked
  function logIn() {
    //Sign in with popup message using google credentials
      return auth.$signInWithPopup("google").then(function(firebaseUser) {
      //Assign result of signin to current user object
      currentUser = firebaseUser;
      //Log user's email
      //Get idToken
      return currentUser.user.getToken().then(function(idToken) {
        //GET request to /dashboard route, send idToken in header
         return $http({
          method: 'GET',
          url: '/users',
          headers: {
            id_token: idToken
          }
        }).then(function(response) { //when $http promise resolved:
          isUser = true;
          return response;
        }).catch(function(err) { //If theres an err status code
          if(err.status == 403) { //The user is either not authorized
            console.log("User not authorized");
            throw err;
          } else if(err.status !== 403) { //Or there was some other error (likely 500, query erro)
            console.log("Server error: ", err);
            throw err;
          }
        })
      });
    });

  }//End login fxn

  //Check authorization satus
  auth.$onAuthStateChanged(function(firebaseUser){
    // firebaseUser will be null if not logged in
    currentUser = firebaseUser;
    if(firebaseUser) {
      isUser = true;
    }
  });

  /**********************************************
  //Lougout fxn, runs when logout btn is clicked
  ***********************************************/
  function logOut() {
    //Firebase sign out method
     return auth.$signOut().then(function() {
      console.log("User succesfully logged out");
      isUser = false;
    });
  }//End logout fxn
  /************************************
  Function to be called in controllers
  that need access to currentUser
  *************************************/
  function userChecker() {
    return currentUser.getToken()
      .then(function(idToken) {
        return $http({
          method: 'GET',
          url: '/users',
          headers: {
            id_token: idToken
          }
        })
        .then(function(response) {
          return response;
        })
        .catch(function(err) {
          console.log("getUser in UserFactory err: ", err);
          throw err;
        })
      })
  }
  /************************************
  function to be called in controllers
  that need to ngShow/Hide buttons
  *************************************/
  function getUser() {
    return currentUser;
  }
  /*********************
  Put all functions
  into publicApi object
  ***********************/
  var publicApi = {
    logIn: function() {
      return logIn();
    },
    logOut: function() {
      return logOut();
    },
    getUser: function() {
      return getUser();
    },
    userChecker: function() {
      return userChecker();
    },
    auth: auth,
    isUser: isUser
  };
  /*************************
  Return publicApi object
  so controllers can access
  **************************/
  return publicApi;

}]);

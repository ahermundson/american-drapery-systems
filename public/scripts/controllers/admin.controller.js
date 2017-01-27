app.controller('AdminController', ['UserFactory', '$http', "$mdDialog", "$timeout", "$mdDialog",  function(UserFactory, $http, $mdDialog, $timeout, $mdDialog) {
  const self = this;
  var currentUser = {};
  self.users = [];
  self.unauthorized = false;
  self.redId = false;
  self.greenId = false;

  UserFactory.auth.$onAuthStateChanged(function(firebaseUser){
    // firebaseUser will be null if not logged in
    currentUser = firebaseUser;
    getUsers();
  });

  function getUsers() {
    currentUser = UserFactory.getUser();
    console.log('getting users - currentUser:', currentUser);
    currentUser.getToken().then(function(idToken) {
      $http({
        method: 'GET',
        url: '/users/all',
        headers: {
          id_token: idToken
        }
      }).then(function(response){
        self.users = response.data;
        self.loading = true;
      });
    });
  }

  self.addUser = function(newUser) {
    if (newUser.authorized == null) {
      newUser.authorized = false;
    }
    if (newUser.can_edit_users == null) {
      newUser.can_edit_users = false;
    }
    currentUser = UserFactory.getUser();
    currentUser.getToken().then(function(idToken) {
      $http({
        method: 'POST',
        url: '/users/',
        data: newUser,
        headers: {
          id_token: idToken
        }
      }).then(function(response){
        newUser.id = response.data[0].id;
        self.users.push(newUser);
        greenRow(newUser.id);
      }).catch(function(err) {
        console.log("Error in user post");
        if (err.status === 403) {
          self.unauthorized = true;
          console.log("In error 403: ", self.unauthorized);
        }
      });
    });
  }

  function deleteUser(id) {
    currentUser = UserFactory.getUser();
    currentUser.getToken().then(function(idToken) {
      $http({
        method: 'DELETE',
        url: '/users/' + id,
        headers: {
          id_token: idToken
        }
      }).then(function(response){
      removeObjById(self.users, id);
      self.redId = false;
      }).catch(function(err) {
        if (err.status === 403) {
          self.unauthorized = true;
          notAuthorizedAlert();
        }
      });
    });
  }

  self.showConfirm = function(ev, id, first, last) {
    // Appending dialog to document.body to cover sidenav in docs app
    console.log('id del', id);
    self.redId = id;
    var confirm = $mdDialog.confirm()
      .title('Are you sure you wish to delete user ' + first + ' ' + last + '?')
      .targetEvent(ev)
      .ok('Yes, delete user.')
      .cancel('No');
    $mdDialog.show(confirm).then(function() {
      deleteUser(id);
    }, function() {
      self.redId = false;
    });
  };

  function greenRow(id) {
    self.greenId = id;
    console.log('green id', id);
    $timeout(function(){
      self.greenId = 0;
    }, 1000);
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
          self.redId = false
          alert = undefined;
        });
    }
}]);

var app = angular.module('IdeaBox', ['ui.router']);


//Posts factory
app.factory('posts', ['$http', 'auth', function($http, auth){
  var o = {
    posts: []
  };
  //Get all posts
  o.getAll = function() {
    return $http.get('/posts').success(function(data){
      angular.copy(data, o.posts);
    });
  }

  //Create a post
  o.create = function(post) {
    return $http.post('/posts', post, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      o.posts.push(data);
    });
  };

  //Delete post
  o.remove = function(post) {
    $http({ url: '/posts/' + post._id,
      method: 'DELETE'
    }).then(function(res) {
      // Deleted
      console.log(res);
      // Update list
      o.getAll();
    },function(error) {
      console.log(error);
    });
  };

  //Get on post for show comments
  o.get = function(id) {
    return $http.get('/posts/' + id).then(function(res){
      return res.data;
    });
  };

  //Add comment function
  o.addComment = function(id, comment) {
    return $http.post('/posts/' + id + '/comments', comment, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    });
  };

  //Vote
  o.upvote = function(post) {
    return $http.put('/posts/' + post._id + '/upvote',null, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      post.votes += 1;
    });
  };
    
    //Down vote
    o.downvote = function(post) {
    return $http.put('/posts/' + post._id + '/downvote',null, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      post.contres += 1;
    });
  };

  return o;
}]);

//Auth factory
app.factory('auth', ['$http', '$window', function($http, $window){
  var auth = {};

  auth.saveToken = function (token){
    $window.localStorage['BC-token'] = token;
  }

  auth.getToken = function (){
    return $window.localStorage['BC-token'];
  }

  auth.isLoggedIn = function(){
    var token = auth.getToken();

    if(token){
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.exp > Date.now() / 1000;
    }
    else {
      return false;
    }
  }

  auth.currentUser = function(){
    if(auth.isLoggedIn()){
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.username;
    }
  }

  auth.register = function(user){
    return $http.post('/register', user).success(function(data){
      auth.saveToken(data.token);
    });
  }

  auth.logIn = function(user){
    return $http.post('/login', user).success(function(data){
      auth.saveToken(data.token);
    });
  }

  auth.logOut = function(){
    $window.localStorage.removeItem('BC-token');
  }
  return auth;
}]);

//Config part
app.config([
'$stateProvider',
'$urlRouterProvider',
'$locationProvider',
function($stateProvider, $urlRouterProvider, $locationProvider) {

  $stateProvider
    //Home route
    .state('home', {
      url: '/',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: { //Surtout ne pas modifier
        postPromise: ['posts', function(posts){
          return posts.getAll();
        }]
      }
    })
    //Post route
    .state('posts', {
      url: '/posts/{id}',
      templateUrl: '/posts.html',
      controller: 'PostsCtrl',
      resolve: { //Surtout ne pas modifier
        post: ['$stateParams', 'posts', function($stateParams, posts) {
          return posts.get($stateParams.id);
        }]
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: '/login.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    })
    .state('register', {
      url: '/register',
      templateUrl: '/register.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth){
        if(auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    });
  $locationProvider.html5Mode(true);
}]);

//Main Controller
app.controller('MainCtrl', ['$scope','posts','auth', function($scope,posts,auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.author = auth.currentUser;

  $scope.posts = posts.posts;

  $scope.addPost = function(){
    if(!$scope.title || $scope.title === '' && !$scope.content || $scope.content === ''){
      return;
    }
    else{
      //Push posts from the form
      posts.create({
        author: $scope.author,
        title: $scope.title,
        content: $scope.content,
        category: $scope.category
      });
      $scope.title = '';
      $scope.content = '';
      $scope.category = '';
    }
  };
  $scope.upvote = function(post) {
    posts.upvote(post);
  };
    $scope.downvote = function(post) {
    posts.downvote(post);
  };
  $scope.remove = function(post) {
    posts.remove(post);
  };
}]);

//Post controller
app.controller('PostsCtrl', ['$scope','posts','post', 'auth', function($scope, posts, post,auth){
  $scope.post = post;
  $scope.isLoggedIn = auth.isLoggedIn;
    $scope.date = new Date();

    $scope.addComment = function(){
      if($scope.body === '') { return; }
      posts.addComment(post._id, {
        body: $scope.body,
        date : $scope.date,
        author: 'user',
      }).success(function(comment) {
        $scope.post.comments.push(comment);
      });
      $scope.body = '';
    };
}]);

//Auth controller
app.controller('AuthCtrl', ['$scope','$state','auth',function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}]);

//Navbar for users
app.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);

var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');
var Member = mongoose.model('Member');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
 res.render('index', { title: 'Express' });
});

router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});

router.get('/posts/:post', function(req, res, next) {
  req.post.populate('comments', function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});
router.get('/posts/:post', function(req, res, next) {
  req.post.populate('members', function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});

//POST route for creating posts in database
router.post('/posts', auth, function(req, res, next) { //Auth for create post
  var post = new Post(req.body);
  post.author = req.payload.username; //Set the author fiel when creating post

  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});

//Route for preloading post object
router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);

  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error('can\'t find post')); }

    req.post = post;
    return next();
  });
});

router.param('comment', function(req,res,next,id){
  var query = Comment.findDyId(id);

  query.exec(function(err,comment){
    if(err) {return next(err);}
    if(!comment) {return next(new Error("Can't find comment"));}

    req.comment = comment;
    return next();
  })
})

router.param('member', function(req,res,next,id){
  var query = Member.findDyId(id);

  query.exec(function(err,member){
    if(err) {return next(err);}
    if(!member) {return next(new Error("Can't find member"));}

    req.member = member;
    return next();
  })
})

/*//Reserve method
router.put('/posts/:post/reserve',auth, function(req, res, next) {//Auth for reserve
  req.post.reserve(function(err, post){
    if (err) { return next(err); }
    res.json(post);
  });
});
*/
//Add method
router.put('/posts/:post/addplace',auth, function(req, res, next) {//Auth for add place
  req.post.addplace(function(err, post){
    if (err) { return next(err); }
    res.json(post);
  });
});

/* Delete a post */
router.delete('/posts/:post', function(req, res, next) {
  Post.remove({
    _id : req.params.post
  }, function(err, post) {
    if (err)
        res.send(err);

    Post.find(function(err, posts) {
      if (err)
        res.send(err)
      res.json(posts);
    });
  });
});

//Comments route for a particular post
router.post('/posts/:post/comments',auth, function(req, res, next) {//Auth for comment
  var comment = new Comment(req.body);
  comment.post = req.post;
  comment.author = req.payload.username;

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});
//Comments route for a particular post
router.post('/posts/:post/members',auth, function(req, res, next) {//Auth for member
  var member = new Member(req.body);
  member.post = req.post;
  member.author = req.payload.username;

  member.save(function(err, member){
    if(err){ return next(err); }

    req.post.members.push(member);
    req.post.save(function(err, post) {
      if(err){ return next(err); }

      res.json(member);
    });
  });
});

//Post username and password for a user
router.post('/register', function(req,res,next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message : 'Please fill out all fields.'});
  }

  var user = new User();

  user.username = req.body.username;
  user.email = req.body.email;
  user.name = req.body.name;
  user.lastname = req.body.lastname;
  user.country = req.body.country;
  user.number = req.body.number;
  user.setPassword(req.body.password)

  user.save(function(err){
    if(err){return next(err);}
    return res.json({token: user.generateJWT()})
  });
});

//Login route for authenticate user and return a token
router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

module.exports = router;

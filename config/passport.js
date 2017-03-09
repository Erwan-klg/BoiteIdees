//Passport uses strategies for different authentication methods(password, Google, Facebook)...
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

//Verifiy and authenticate the users
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Identifiant incorrect.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Mot de passe incorrect.' });
      }
      return done(null, user);
    });
  }
));

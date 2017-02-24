var mongoose = require('mongoose');

/////
// It's strongly recommended that use an environment
// variable for referencing the secret and keep it out of the codebase.
/////

var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true},
  email: String,
  name: String,
  lastname: String,
  number: String,
  country: String,
  hash: String,
  salt: String
});

var crypto = require('crypto');

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');

  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

  return this.hash === hash;
};

var jwt = require('jsonwebtoken');

UserSchema.methods.generateJWT = function() {

  // set expiration to 60 days
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, 'SECRET');
};

mongoose.model('User', UserSchema);

var mongoose = require('mongoose');

var MemberSchema = new mongoose.Schema({
  author: String,
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
});

mongoose.model('Member', MemberSchema);

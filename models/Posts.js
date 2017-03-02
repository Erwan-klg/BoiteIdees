var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  author:String,
  title: String,
  content: String,
  category: String,
  votes: {type: Number, default: 0},
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

PostSchema.methods.upvote = function(cb) {
  this.votes += 1;
  this.save(cb);
};

mongoose.model('Post', PostSchema);

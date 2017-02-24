var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  author:String,
  start: String,
  end: String,
  car: String,
  info:String,
  places: {type: Number, default: 0},
  price: {type: Number, default: 0},
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }]
});

PostSchema.methods.reserve = function(cb) {
  if(this.places > 0){
    this.places -= 1;
    this.save(cb);
  }
};
PostSchema.methods.addplace = function(cb) {
  this.places += 1;
  this.save(cb);
};

mongoose.model('Post', PostSchema);

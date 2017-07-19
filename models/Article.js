// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({
  // title is a required string
  title: {
    type: String,
    required: true
  },
  // excerpt is a required string
  excerpt:{
    type: String,
    required: true
  },
  // author is required
  author:{
    type: String,
    required: true
  },
  // link is a required string
  link: {
    type: String,
    required: true
  },
  // Notes
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;

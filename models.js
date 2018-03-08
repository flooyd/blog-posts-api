'use strict';

const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true}
  },
  created: {type: Date, default: Date.now}
});

blogPostSchema.virtual('authorFull').get(function() {
  return this.author.firstName + ' ' + this.author.lastName;
});

//shouldn't this give ID?
blogPostSchema.methods.serialize = function() {
  return {
    title: this.title,
    content: this.content,
    author: this.authorFull,
    created: this.created,
    id: this.id
  };
};

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = {BlogPost};
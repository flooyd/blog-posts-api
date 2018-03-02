const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {BlogPosts} = require ('./models');

const fieldChecker = (req, res, next) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  next();
};

BlogPosts.create('Scary story', 'some scary story content', 'bob');

router.get('/', (req, res) => {
  res.json(BlogPosts.get());
})

router.post('/', [jsonParser, fieldChecker], (req, res) => {
  const blogPost = BlogPosts.create(req.body.title, req.body.content, req.body.author);
  res.status(201).json(blogPost);
});

router.put('/:id', [jsonParser, fieldChecker], (req, res) => {
  if(req.params.id != req.body.id) {
    const message = 'Request ID does not match Params ID';
    console.error(message);
    return res.status(400).send(message);
  }

  const updatedBlogPost = BlogPosts.update({
    id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    date: Date.now()
  });

  res.status(200).json(updatedBlogPost);
})

router.delete('/:id', (req, res) => {
  BlogPosts.delete(req.params.id);
  console.log(`Deleted blog post ${req.params.id}`);
  res.status(204).end();
})

module.exports = router;
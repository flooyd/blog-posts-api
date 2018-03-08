const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {BlogPost} = require ('./models');

const fieldChecker = (req, res, next) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing -${field}- in request body`
      console.error(message);
      return res.status(400).json({
        badRequest: message
      });
    }
  }

  next();
};

const authorChecker = (req, res, next) => {
  if(!req.body.author.firstName || !req.body.author.lastName) {
    res.status(400).json({
      badRequest: 'Missing author.firstName or author.lastName'
    });
  }

  next();
}

router.get('/', (req, res) => {
  BlogPost.find()
  .then(blogPosts => {
    blogPosts = blogPosts.map(b => b.serialize());

    res.json({
      blogPosts: blogPosts
    });
  })
  .catch(err => {
    console.err(err);
    res.status(500).json({
      message: 'Internal server error'
    });
  })
});

router.get('/:id', (req, res) => {
  BlogPost.findById(req.params.id)
  .then(blogPost => {
    res.json(blogPost.serialize());
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({
      message: 'Internal server error'
    });
  });
})

router.post('/', [jsonParser, fieldChecker, authorChecker], (req, res) => {
  BlogPost.create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  })
  .then(blogPost => {
    res.status(201).json(blogPost.serialize());
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});

router.put('/:id', [jsonParser, fieldChecker, authorChecker], (req, res) => {
  if(req.body.id !== req.params.id) {
    return res.status(400).json({
      badRequest: 'body id and param id do not match'
    });
  }

  const blogPostToUpdate = {};
  const possibleFields = ['title', 'content', 'author'];

  possibleFields.forEach(field => {
    if(field in req.body) {
      blogPostToUpdate[field] = req.body[field];
    }
  });

  BlogPost.findByIdAndUpdate(req.params.id, {$set: blogPostToUpdate}, {new: true})
  .then(blogPost => res.status(200).json(blogPost.serialize()))
  .catch(err => {
    console.error(err);
    res.status(500).json({
      message: 'Internal server error'
    });
  })
})

router.delete('/:id', (req, res) => {
  //why does a "real id" work but a random number doesn't?
  BlogPost.findByIdAndRemove(req.params.id)
  .then(blogPost => res.status(204).send())
  .catch(err => res.status(500).json({
    message: 'Internal server error'
  }));
});

router.use('*', (req, res) => {
  res.status(404).json({message: 'Not found'});
})



module.exports = router;
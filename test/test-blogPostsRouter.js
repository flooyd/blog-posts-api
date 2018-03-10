const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const faker = require('faker');
const mongoose = require('mongoose');

const {
  app,
  runServer,
  closeServer
} = require('../server');

const {
  BlogPost
} = require('../models');
const {
  TEST_DATABASE_URL
} = require('../config');

chai.use(chaiHttp);

const generateBlogPost = function () {
  return {
    title: faker.lorem.sentence(3, 5),
    content: faker.lorem.paragraph(5),
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    }
  };
};

const seedDb = () => {
  const seedData = [];

  for (let i = 1; i < 10; i++) {
    seedData.push(generateBlogPost());
  }

  return BlogPost.insertMany(seedData);
}

const tearDownDb = () => {
  mongoose.connection.dropDatabase();
  console.log('Database dropped');
}

describe('Blog Posts API', function () {
  before(function () {
    return runServer(TEST_DATABASE_URL, 3001);
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function () {
    return seedDb();
  });

  afterEach(function () {
    tearDownDb();
  });


  describe('GET', function () {
    it('should list blog posts on GET', function () {
      let res;

      return chai.request(app)
        .get('/blog-posts')
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body.blogPosts).to.have.length.of.at.least(1);
          let x = BlogPost.count();

          return BlogPost.count();
        })
        .then(function (count) {
          expect(res.body.blogPosts).to.have.lengthOf(count);
        });
    });
  });


  describe('POST', function () {
    it('should create blog post on POST', function () {
      const blogPost = generateBlogPost();

      return chai.request(app)
        .post('/blog-posts')
        .send(blogPost)
        .then(function (res) {
          expect(res).to.be.json;
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body.id).to.not.be.null;

          expect(res.body).to.have.keys(
            'title', 'content', 'author', 'created', 'id');

          Object.keys(blogPost).forEach(function (key) {
            if (key === 'author') {
              expect(res.body[key]).to.equal(
                `${blogPost[key].firstName} ${blogPost[key].lastName}`)
            } else {
              expect(res.body[key]).to.equal(blogPost[key]);
            }
          });

          return BlogPost.findById(res.body.id);
        })
        .then(function (_blogPost) {
          expect(_blogPost.title).to.equal(blogPost.title);
          //etc etc (I'll test for real in project...:D)
        });
    });
  });

  describe('DELETE', function () {
    it('should delete blog post on DELETE', function () {
      let blogPost;

      return BlogPost.findOne()
        .then(function (_blogPost) {
          blogPost = _blogPost;
          return chai.request(app)
            .delete(`/blog-posts/${blogPost.id}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
        });
    });
  });

  //adding this to allow commit for travis
  describe('PUT', function () {
    it('should update blog post on PUT', function () {
      const fieldsToUpdate = {
        title: "new title"
      };

      return BlogPost
        .findOne()
        .then(function (blogPost) {
          fieldsToUpdate.id = blogPost.id;

          return chai.request(app)
            .put(`/blog-posts/${fieldsToUpdate.id}`)
            .send(fieldsToUpdate);
        })
        .then(function (res) {
          expect(res).to.have.status(200);

          return BlogPost.findById(fieldsToUpdate.id)
        })
        .then(function (blogPost) {
          expect(blogPost.title).to.equal(fieldsToUpdate.title);
        });
    });
  });
});
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const {
  app,
  runServer,
  closeServer
} = require('../server');

chai.use(chaiHttp);

describe('Blog Posts', function () {
  before(function(){
    return runServer(true);
  })

  after(function() {
    return closeServer();
  })

  it('should list blog posts on GET', function() {
    return chai.request(app)
    .get('/blog-posts')
    .then(function(res){
      expect(res).to.be.json;
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.at.least(2);

      const expectedKeys = ['title', 'content', 'author', 'publishDate', 'id'];
      res.body.forEach(blogPost => {
        expect(blogPost).to.be.an('object');
        expect(blogPost).to.have.keys(expectedKeys);
      })
      
    })
  })

  it('should create blog post on POST', function() {
    let blogPost = {
      title: 'Some neat title',
      content: 'Some neat content',
      author: 'Some neat author'
    };

    return chai.request(app)
    .post('/blog-posts')
    .send(blogPost)
    .then(function(res) {
      expect(res).to.be.json;
      expect(res).to.have.status(201);
      expect(res.body).to.be.an('object');

      const expectedKeys = ['id','title', 'content', 'author', 'publishDate'];
      expect(res.body).to.have.keys(expectedKeys);

      expect(res.body).to.deep.equal(Object.assign(blogPost, {
        id: res.body.id,
        publishDate: res.body.publishDate
      }));
    })
  })

  it('should delete blog post on DELETE', function() {
    return chai.request(app)
    .get('/blog-posts')
    .then(function(res){
      const id = res.body[0].id;
      return chai.request(app)
      .delete(`/blog-posts/${id}`);
    })
    .then(function(res){
      expect(res).to.have.status(204);
    })
  })

  it('should update blog post on PUT', function() {
    const updatedPost = {
      title: 'updated post',
      content: 'updated content',
      author: 'updated author'
    };

    return chai.request(app)
    .get('/blog-posts')
    .then(function(res){
      const id = res.body[0].id;
      updatedPost.id = id;
      return chai.request(app)
      .put(`/blog-posts/${id}`)
      .send(updatedPost);
    })
    .then(function(res){
      expect(res).to.have.status(200);
    })
  })
})
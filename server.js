const express = require('express');
const morgan = require('morgan');
const app = express();
const blogPostsRouter = require('./blogPostsRouter');

app.use(morgan('common'));

app.use('/blog-posts', blogPostsRouter);

let server;

function runServer(bIsTest) {
  console.log(bIsTest);
  //different port so that I can run nodemon while testing
  let port = process.env.PORT || 8080;
  if(bIsTest) {
    port = process.env.PORT || 8081;
  }
  
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
      resolve();
    }).on('error', err => {
      reject(err);
    });
  });
}

function closeServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    console.log('server closed');
    server.close(err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

if (require.main === module) {
  runServer(false).catch(err => console.log(err))
  //.then(server => {
    // I don't really understand why the promise calls resolve with
    //server passed as a parameter. I think without doing something like this,
    //it is not necessary to pass the server.
    //console.log(server);
  //})
}

module.exports = {
  app,
  runServer,
  closeServer
};
'use strict';
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const app = express();
const blogPostsRouter = require('./blogPostsRouter');
const {PORT, DATABASE_URL} = require('./config');

mongoose.Promise = global.Promise;

app.use(morgan('common'));
app.use('/blog-posts', blogPostsRouter);

let server;

function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Server running on ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      })
    })
  })
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing mongoose connection and server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      })
    })
  })
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err))
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
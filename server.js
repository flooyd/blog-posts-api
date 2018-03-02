const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(morgan('common'));

app.get('/', (req, res) => {
  res.send('hi12345');
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Listening on ${process.env.PORT || 8080}`);
});
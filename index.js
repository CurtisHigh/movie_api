const express = require('express')
lodash = require('lodash')
bodyParser = require('body-parser')
fs = require('fs')
path = require('path')
morgan = require('morgan');

const app = express();

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
//const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

let movies = [
  {
    title: 'Avatar'
  },
  {
    title: 'Lord of the Rings'
  },
  {
    title: 'Star Wars'
  }
];

//log to txt file
//app.use(morgan('combined', {stream: accessLogStream}));
app.use(morgan('common'));

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
  res.json(movies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('An error has occured');
});

app.use('/public', express.static('./public'));

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
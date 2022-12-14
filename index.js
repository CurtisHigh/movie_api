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

app.get('/movies', (req, res) => {
  res.send('list of movies');
});

app.get('/movies/:title', (req, res) => {
  res.send("A JSON object containing data about the provided movie title including the description, genre, director, image URL, whether it's featured or not");
});

app.get('/movies/genre/:genreName', (req,res) => {
  res.send('A JSON object containing information about the specified genre name');
});

app.get('/movies/directors/:directorName', (req,res) => {
  res.send('A JSON object containing data about a director (bio, birth year, death year) by name');
});

app.post('/users', (req,res) => {
  res.send('A JSON object containing the users name and a generated id {"name": "usersName", "id": "randomID"}');
});

app.put('/users/:id', (req,res) => {
  res.send('A JSON object containing the updated user info {"name": "updatedUserName", "id":"userId"}');
});

app.post('/users/:id/:movieTitle', (req,res) => {
  res.send('A message stating that "movieTitle" has been added to "userId\'s" list of favorites');
});

app.delete('/users/:id/:movieTitle', (req,res) => {
  res.send('A message stating that "movieTitle" has been deleted from "userId\'s" list of favorites');
});

app.delete('/users/:id', (req,res) => {
  res.send('A massage stating that users email has been removed from the list of users');
});


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

//error handling middleware function
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('An error has occured');
});

app.use('/public', express.static('./public'));

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
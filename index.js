const express = require('express')
//const { isObjectIdOrHexString } = require('mongoose')
//const { User } = require('./models.js')
lodash = require('lodash')
bodyParser = require('body-parser')
fs = require('fs')
path = require('path')
morgan = require('morgan')
mongoose = require('mongoose')
Models = require('./models.js');

const app = express();

//body-parser middleware, must be above any other endpoint middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//require cors to control which domains have access to the API server
const cors = require('cors');
app.use(cors());

//import auth.js
let auth = require('./auth')(app);//(app) insures that express is available in auth.js

//require passport.js
const passport = require('passport');
require('./passport');

//DB collection models defined in models.js
const Movies = Models.Movie;
const Users = Models.User;

//allows mongoose to connect to the myFlixDB database
//{ useNewUrlParser: true, useUnifiedTopology: true } required to avoid deprecation warnings 
mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
//const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

//GET all movies
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET all users
app.get('/users', passport.authenticate('jwt', {session: false}), (req,res) => {
  Users.find()
  .then((users) => {
    res.status(201).json(users)
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })
});

//GET user by UserName
app.get('/users/:UserName', passport.authenticate('jwt', {session: false}), (req,res) => {
  Users.findOne({UserName: req.params.UserName})
  .then((user) => {
    if(!user) {
      res.status(400).send(req.params.UserName + ' does not exist.')
    } else {
      res.status(201).json(user)
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })
});

//GET movie by title
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({Title: req.params.Title})
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET genre information
app.get('/movies/genre/:genreName', passport.authenticate('jwt', {session: false}), (req,res) => {
  Movies.findOne({'Genre.Name': req.params.genreName})
  .then((movie) => {
    res.status(201).json(movie.Genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  })
});

//GET director info
app.get('/movies/directors/:directorName', passport.authenticate('jwt', {session: false}), (req,res) => {
  Movies.findOne({'Movies.Director': req.params.directorName})
  .then((movie) => {
    res.status(201).json(movie.Director);
  })
  .catch((err) => {
    console.error(err)
    res.status(500).send('Error: ' + err);
  })
});

//POST a new user
app.post('/users', (req,res) => {
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({UserName: req.body.UserName})
  .then((user) => {
    if(user) {
      return res.status(400).send(req.body.UserName + ' already exists');
    } else {
      Users.create({
        UserName: req.body.UserName,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthdate: req.body.Birthdate
      })
      .then((user) => {
        res.status(201).json(user)
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      })
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Allow users to update account info
app.put('/users/:UserName', passport.authenticate('jwt', {session: false}), (req,res) => {
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({UserName: req.params.UserName}, {
    $set: {
      UserName: req.body.UserName,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthdate: req.body.Birthdate
    }
  })
  .then((user) => {
    res.status(201).json(user)
  })
  .catch((err) => {
    console.error(err);
    res.status(400).send('Error: ' + err);
  })
});

//Allow user to add to favorites list
app.post('/users/:UserName/movies/:MovieId', passport.authenticate('jwt', {session: false}), (req,res) => {
  Users.findOneAndUpdate({UserName: req.params.UserName}, {
    $push: {Favorites: req.params.MovieId}
  })
  .then((updatedUser) => {
    res.status(201).json(updatedUser)
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })
});

//Allow user to delete from favorites list
app.delete('/users/:UserName/movies/:MovieId', passport.authenticate('jwt', {session: false}), (req,res) => {
  Users.findOneAndUpdate({UserName: req.params.UserName}, {
    $pull: {Favorites: req.params.MovieId}
  })
  .then((updatedUser) => {
    res.status(201).json(updatedUser)
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })
});

//DELETE user from list
app.delete('/users/:UserName', passport.authenticate('jwt', {session: false}), (req,res) => {
  Users.findOneAndRemove({UserName: req.params.UserName})
  .then((user) => {
    if(!user) {
      res.status(400).send('Cannot find user ' + req.params.UserName)
    } else {
      res.status(200).send(req.params.UserName + ' has been removed.')
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err)
  })
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
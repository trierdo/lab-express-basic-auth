const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const saltRounds = 11;
const salt = bcrypt.genSaltSync(saltRounds);



router.get('/login', (req, res, next) => {
  res.render('login');
});


router.post('/login', (req, res, next) => {

const username =  req.body.username;
let hashWord = req.body.hashWord;

const newLoginUser = new User({
  username,
  hashWord
});

User.hashWord = bcrypt.hashSync(hashWord, salt);


  if (username === "" || hashWord === "") {
    res.render("login", {
      errorMessage: "Please enter both, username and password to login."
    });
    return;
  } 

  User.findOne({ username })
  .then(user => {
      if (!user) {
        res.render("login", {
          errorMessage: "The username doesn't exist."
        });
        return;
      }
console.log(User.hashWord, ' ', user.hashWord);
      if (User.hashWord === user.hashWord) {
        // Save the login in the session!

        console.log('### ', req.session);

        req.session.currentUser = user;
        res.redirect("/");
      } else {
        console.log('#### passwort nicht gleich');
        res.render("login", {
          errorMessage: "Incorrect password"
        });
      }
  })
  .catch(error => {
    next(error);
  })
});



router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', (req, res, next) => {

  const {
    username,
    hashWord
  } = req.body;


  const newUser = new User({
    username,
    hashWord
  });
  newUser.hashWord = bcrypt.hashSync(hashWord, salt);

  //console.log(newUser.username, newUser.hashWord);

  if (username === "" || hashWord === "") {
    res.render("signup", {
      errorMessage: "Indicate a username and a password to sign up."
    });
    return;
  }


  User.findOne({
      "username": username
    })
    .then(user => {
      if (user !== null) {
        res.render("signup", {
          errorMessage: "The username " + username + " already exists!"
        });
        return;
      }
      newUser.save()
        .then((thisUser) => {
          res.redirect('/');
        })
        .catch((err) => {
          console.log('gefällt mir net, weil... ', err);
        })

    })



});

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    // cannot access session here
    res.redirect("/login");
  });
});



module.exports = router;
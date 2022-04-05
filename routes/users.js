
const { response } = require('express');
var express = require('express');
const { redirect } = require('express/lib/response');
var router = express.Router();
var models = require('../models');
var authService = require('../services/auth');


//login/logout routes
router.get('/', function (req, res, next) {
  res.cookie('jwt', '', { expires: new Date(0) }); //ensure user logout
  res.render('login');
});

router.get('/login', function (req, res, next) {
  res.cookie('jwt', '', { expires: new Date(0) }); //ensure user logout
  res.render('login');
})

router.get('/logout', function (req, res, next) {
  res.cookie('jwt', '', { expires: new Date(0) }); //ensure user logout
  res.render('login');
});

//make authenticate user, then direct to their profile page, if admin route to admin main page.
router.post('/login', function (req, res, next) {
  models.users.findOne({
    where: { Username: req.body.username }
  })
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: 'Login Failed' });
      } else {
        let passwordMatch = authService.comparePasswords(req.body.password, user.Password);

        if (passwordMatch && user.Admin == false) {
          let token = authService.signUser(user);
          res.cookie('jwt', token);
          res.redirect('profile');
        } else if (passwordMatch && user.Admin == true) {
          let token = authService.signUser(user);
          res.cookie('jwt', token);
          res.redirect('/users/admin')
        } else {
          console.log('Invalid Login');
          res.send('Invalid Login');
        }

      }
    });
});

//once logged in, display user their profile
router.get('/profile', function (req, res, next) {
  let token = req.cookies.jwt;

  if (token) {
    authService.verifyUser(token).then(user => {

      if (user) {
        models.posts.findAll({
          where: {
            UserId: user.UserId,
            Deleted: false
          }
        }).then(usersPosts => {
          res.render('userProfile', {
            UserId: user.UserId,
            FirstName: user.FirstName,
            LastName: user.LastName,
            Email: user.Email,
            Username: user.Username,
            posts: usersPosts
          })
        })
      } else {
        res.redirect('login');
      }

    })
  }
});

//delete a post
router.post('/deletePost/:id', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user) {
        models.posts
          .update(
            { Deleted: true },
            { where: { PostId: req.params.id } })
          .then(res.redirect('/users/profile'));
      } else {
        res.send('You may not access, return to login');
      }
    });
  }
});


//get a post's information and rnder the edit post page
router.get('/editPost/:id', function (req, res, next) {

  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user) {
        models.posts.findOne({
          where: { PostId: req.params.id }
        }).then(editPost => {
          res.render('editPost', { post: editPost })
        })
      } else {
        res.send('You may not access, return to login');
      }
    })
  }
});

//update post and route back to the user's profile.
router.post('/editedPost/:id', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user) {
        models.posts
          .update(
            { PostTitle: req.body.postTitle, PostBody: req.body.postBody },
            { where: { PostId: req.params.id } })
          .then(result =>
            res.redirect('/users/profile'))
      } else {
        res.send('You may not access, return to login');
      }
    })
  }
});


//render the page for a user to create a new post.
router.get('/createPost/:id', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user) {
        res.render('createPost');
      } else {
        res.send('You may not access, return to login');
      }
    })
  }
});

//store the new post in the database and redirect to the user's profile.
router.post('/createPost', function (req, res, next) {
  let token = req.cookies.jwt;

  if (token) {
    authService.verifyUser(token).then(user => {
      if (user) {
        models.posts.create({
          UserId: user.UserId,
          PostTitle: req.body.postTitle,
          PostBody: req.body.postBody
        }).then(response => {
          res.redirect('profile');
        })

      } else {
        res.send('You may not access, return to login');
      }
    })
  }
});

//render the sign up for new account page.
router.get('/signup', function (req, res, next) {
  res.cookie('jwt', '', { expires: new Date(0) }); //log last user out if needed
  res.render('signup');
});

router.post('/signup', function (req, res, next) {
  if (req.body.password != req.body.password2) {
    res.send('Passwords do not match.');
  } else {
    models.users.findOrCreate({
      where: { Username: req.body.username },
      defaults: {
        FirstName: req.body.firstName,
        LastName: req.body.lastName,
        Email: req.body.email,
        Password: authService.hashPassword(req.body.password)
      }
    }).spread(function (result, created) {
      if (created) {
        res.redirect('login');
      } else {
        console.log('User already exists');
        res.redirect('signup');
      }
    })
  }
});

module.exports = router;
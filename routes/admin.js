const { useColors } = require('debug/src/browser');
var express = require('express');
const { redirect } = require('express/lib/response');
var router = express.Router();
var models = require('../models');
var authService = require('../services/auth');

//routes to logout
router.get('/logout', function (res, req, next) {
  res.render('login');
});

router.get('/logout', function (req, res, next) {
  res.cookie('jwt', '', { expires: new Date(0) });
  res.render('login');
});


// admin route to main page of users
router.get('/', function (req, res, next) {
  let token = req.cookies.jwt;

  if (token) {
    authService.verifyUser(token).then(user => {

      //when routing to the main admin page, check if the user is an Admin
      if (user.Admin) {
        //find all the users that haven't been deleted
        models.users.findAll({
          where: { Deleted: false }, raw: true
        }).then(allUsers => {
          res.render("listUsers", { users: allUsers })
        })
      } else {
        res.send('Admin you are not! Return to login you must.');
      }

    })
  }
});


// delete a user from main admin page, refresh page
router.post('/deleteUser/:id', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user.Admin == true) {
        models.users
        .update(
          { Deleted: true },
          {where: { UserId: req.params.id }})
          .then(res.redirect('/users/admin/'));
        } else {
        res.send('You may not access, return to login');
      }
    });
  }
});

//Admin view a user's profile
router.get('/:id', function (req, res, next) {
  let token = req.cookies.jwt;

  if (token) {
    authService.verifyUser(token).then(user => {

      //when routing to the main admin page, check if the user is an Admin
      if (user.Admin) {
        models.users.findAll({
          where: {
            UserId: req.params.id
          }
        }).then(currentUser => {
          models.posts.findAll({
            where: {
              UserId: req.params.id,
              Deleted: false
            }
          }).then(usersPosts => {
            res.render("adminProfile", { user: currentUser[0], posts: usersPosts })
          })
        })
      } else {
        res.send('Admin you are not! Return to login you must.');
      }

    })
  }
});


//delete a post
router.post('/deletePost/:id', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user.Admin == true) {
        models.posts
        .update(
          { Deleted: true },
          {where: { PostId: req.params.id }})
          .then(res.redirect('/users/admin/'));
        } else {
        res.send('You may not access, return to login');
      }
    });
  }
});


module.exports = router;
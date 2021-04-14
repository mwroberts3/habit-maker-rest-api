const express = require('express');
const router = express.Router();

const { body } = require('express-validator');

const authController = require('../controllers/auth-controller');

const User = require('../model/user-model');

router.put('/signup', 
[
    body('email')
      .isEmail()
      .withMessage('invalid email')
      .custom((value) => {
        return User.findOne({ email: value})
          .then((result) => {
            if (result) {
              throw new Error('user with email already exists');
            }
          })
      }),
    body('password')
      .trim()
      .isLength({ min: 5 })
      .withMessage('password too short'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value != req.body.password) {
            throw new Error('passwords do not match');
        } else {
            return value;
        }
      })
],
authController.signup);

router.post('/login',
 [
    body('email')
      .trim()
      .isEmail()
 ]    
, authController.login);

module.exports = router;
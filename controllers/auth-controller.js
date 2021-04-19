const User = require('../model/user-model');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

const { validationResult } = require('express-validator');

exports.signup = (req, res, next) => {
    const errors = validationResult(req).array();
    if (errors.length > 0) {
        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        throw error;
    };

    let passwordHash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));

    let user = new User({
        username: req.body.username,
        password: passwordHash,
    });

    user.save()
        .then(() => {
            const token = jwt.sign({ 
                username: user.username, userId: user._id.toString()
            }, 'qwepoiasdlkjzxcmnb', 
            {expiresIn: '1hr'}
            );
            req.userId = token.userId;
            res.status(201).json({ message: 'new user added', token });
        })
        .catch(err => console.log(err));
};

exports.login = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('invalid username');
        error.statusCode = 422;
        throw error;
    };
    
    User.findOne({ username: req.body.username })
    .then((user) => {
        if (user) {
            if (!bcrypt.compareSync(req.body.password, user.password)) {
                const error = new Error('Wrong password!');
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign({ 
                username: user.username, userId: user._id.toString()
            }, 'qwepoiasdlkjzxcmnb', 
            {expiresIn: req.body.rememberMe ? '36h' : '1h'}
            );
            req.userId = token.userId;
            res.status(200).json({token});
        }
        res.status(400).json();
    })
    .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
    });
};
const express = require('express');
const {
    check, body
} = require('express-validator')

const User = require('../models/User');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', 
[
    body('email').isEmail().withMessage('Email or password was invalid').normalizeEmail().trim(),
    body('password', 'Email or password was invalid').isLength({min: 6}).isAlphanumeric()
    .trim()
]    
, authController.postLogin);

router.get('/signup', authController.getSignUp);

router.post('/signup',
    [
        check('email').isEmail().withMessage('Invalid email!').custom((value, {req}) => {
            return User.findOne({
                email: value
            })
            .then((user) => {
                if (user) {
                    return Promise.reject('E-mail already used!');
                }
            });
            // if (value === 'phongvt.b8139@st.usth.edu.vn') {
            //     throw new Error('Forbidden!');
            // }
            // return true;
        })
        .normalizeEmail().trim(),
        body('password', 'Password minimum length is 6 and is alphanumeric').isLength({min: 6}).isAlphanumeric()
        .trim(),
        body('confirmPassword').custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match!');
            }
            return true;
        }).trim()
    ]
    , authController.postSignUp);

router.post('/logout', authController.postLogout);

router.get('/forgot', authController.getForgot);

router.post('/forgot', authController.postForgot);

router.get('/reset/:resetToken', authController.getReset);

router.post('/reset', authController.postReset);

module.exports = router;
const {
  validationResult
} = require('express-validator')
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgrid = require('@sendgrid/mail');

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  auth: {
    user: 'phongvu99@outlook.com',
    pass: process.env.DB_PASSWORD
  }
});

const verifySMTP = async (req, res, next) => {
  try {
    return transporter.verify();
  } catch (err) {
    console.log(err);
    err.status = 500;
    next(err);
  }
}
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const User = require('../models/User');

const getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = undefined;
  }
  console.log(req.session.isLoggedIn);
  console.log(req.session);
  // const isLoggedIn = req.get('Cookie').split(';')[1].trim().split('=')[1];
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMsg: message,
    userInput: {},
    validationErrors: []
  });
};

const postLogin = async (req, res, next) => {
  // try {
  //   const result = await verifySMTP();
  //   console.log('SMTP Verify', result);
  // } catch (err) {
  //   console.log(err);
  //   next(err);
  // }

  const errors = validationResult(req);
  const email = req.body.email;
  const password = req.body.password;
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMsg: errors.array()[0].msg,
      userInput: {
        email: email
      },
      validationErrors: errors.array()
    });
  }
  try {
    const user = await User.findOne({
      email: email
    });
    if (!user) {
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMsg: 'Invalid e-mail or password',
        userInput: {
          email: email
        },
        validationErrors: []
      });
    }
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        req.session.user = user;
        req.session.isLoggedIn = true;
        console.log('YEAHHHHHHHH');
        return req.session.save(err => {
          console.log(err);
          res.redirect('/');
        });
      }
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMsg: 'Invalid e-mail or password',
        userInput: {
          email: email
        },
        validationErrors: []
      });
    } catch (err) {
      console.log(err);
      res.redirect('/login');
    }
  } catch (err) {
    console.log(err);
    err.status = 500;
    next(err);
  }

  // res.set({
  //   'Set-Cookie': 'loggedIn=true; HttpOnly'
  // });
  // res.setHeader('Set-Cookie', 'loggedIn=true');
  // res.header({
  //   'Set-Cookie': 'loggedIn=true; HttpOnly'
  // });
  // req.session.isLoggedIn = true;
};

const getSignUp = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = undefined;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Sign Up',
    errorMsg: message,
    userInput: {},
    validationErrors: []
  });
};

const postSignUp = async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  // const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Sign Up',
      errorMsg: errors.array()[0].msg,
      userInput: {
        name: name,
        email: email
      },
      validationErrors: errors.array()
    });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
      cart: {
        items: []
      }
    });
    const result = await user.save();
    res.redirect('/login');
    console.log('Sign Up result', result);
    const message = {
      to: email,
      from: 'phongvu99@outlook.com',
      subject: 'Sending with Twilio SendGrid is Fun',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>'
    };
    // const sendgridResult = await sendgrid.send(message1);
    // console.log('Sendgrid result', sendgridResult);
    // const sendResult = await transporter.sendMail(message);
    // console.log('Send (Outlook SMTP) result', sendResult);
  } catch (err) {
    console.log(err);
    err.status = 500;
    next(err);
  }

};

const postLogout = (req, res, next) => {
  console.log('token', req.body._csrf);
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

const getForgot = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = undefined;
  }
  res.render('auth/forgot', {
    path: '/forgot',
    pageTitle: 'Forgot Password',
    errorMsg: message
  });
}

const postForgot = (req, res, next) => {
  crypto.randomBytes(32, async (err, buf) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    console.log('Token hex', buf);
    console.log('Token toString', buf.toString());
    console.log('Token toString(hex)', buf.toString('hex'));
    const token = buf.toString('hex');
    try {
      const user = await User.findOne({
        'email': req.body.email
      });
      if (!user) {
        req.flash('error', 'No account with that email!');
        return res.redirect('/forgot');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      const result = await user.save();
      res.redirect('/');
      console.log('Forgot result', result);
      const message = {
        to: req.body.email,
        from: 'phongvu99@outlook.com',
        subject: 'Password Reset',
        text: 'and easy to do anywhere, even with Node.js',
        html: `<p>You requested a password reset.</p>
        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to reset your password.</p>
        `
      };
      const sendResult = await transporter.sendMail(message);
      console.log('Forgot email result', sendResult);
    } catch (err) {
      console.log(err);
      err.status = 500;
      next(err);
    }
  });
}

const getReset = async (req, res, next) => {
  const token = req.params.resetToken;
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: {
      $gt: Date.now()
    }
  });
  if (!user) {
    req.flash('error', 'Expired link or invalid token');
    return res.redirect('/forgot')
  }
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = undefined;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMsg: message,
    userID: user._id.toString(),
    resetToken: token
  });
}

const postReset = async (req, res, next) => {
  const password = req.body.password;
  const userID = req.body.userID;
  const resetToken = req.body.resetToken;
  try {
    const user = await User.findOne({
      _id: userID,
      resetToken: resetToken,
      resetTokenExpiration: {
        $gt: Date.now()
      }
    });
    if (!user) {
      req.flash('error', 'Expired link or invalid token');
      return res.redirect('/forgot');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    const result = await user.save();
    console.log('Reset password result', result);
    res.redirect('/login');
  } catch (err) {
    console.log(err);
    err.status = 500;
    next(err);
  }

}

module.exports = {
  getLogin: getLogin,
  postLogin: postLogin,
  getSignUp: getSignUp,
  postSignUp: postSignUp,
  postLogout: postLogout,
  getForgot: getForgot,
  postForgot: postForgot,
  getReset: getReset,
  postReset: postReset
};
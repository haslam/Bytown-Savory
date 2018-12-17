const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are logged in'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', `You are now logged out! \u{1F3F3}`); 
  res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
  //if logged in, move to the next controller func call
  if(req.isAuthenticated()) {
    next();
    return;
  }
  req.flash('error', 'You must be logged in!');
  res.redirect('/login');
}

exports.forgot = async (req, res) => {
  
  //redirect to login after sending token email

  //see if user exists
  const user = await User.findOne({ email: req.body.email });
  if(!user) {
    req.flash('info', 'An email will be sent to you if the provided account exist');
    return res.redirect('/login');
  }
 //if user exists, reset tokens and expiry on their account
 //create temp fields in db
 user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
 user.resetPasswordExpires = Date.now() + 3600000; //one hour from now

await user.save();
 //res.json(user);
 //send them email with the token
 //flash reset message success
 const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
 req.flash('success', `Your have been emailed a reset link. ${resetURL}`);
 res.redirect('/login');
};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if(!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  //if there is a user, show reset password form
  console.log(user.resetPasswordExpires);
 res.render('reset', { title: "Reset password"});
};

exports.confirmedPasswords = (req, res, next) => {
  if(req.body.password === req.body['password-confirm']) {
    return next();
  }
 req.flash('error', 'Passwords do no match!');
 res.redirect('back');
};

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if(!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
  //setPassword exposed by the use of passportLocalMongoose in User.js
  //since setPassword doesn't return a promise, we use the promisy lib and bind
  //  it to user => (promisify(user.setPassword, user[binding]))
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  //clean the token
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
 //save the user and return its [who]object for login purpose
  const updatedUser = await user.save();
  //leverage passport's login() and pass in which user to login
  await req.login(updatedUser);
  req.flash('success', 'Your password has been reset!');
  res.redirect('/');

}
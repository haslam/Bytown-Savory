const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');


router.get('/', catchErrors(storeController.getStores));
router.get('/add', authController.isLoggedIn, catchErrors(storeController.addStore));
router.get('/stores', storeController.getStores);

router.post('/add', 
  storeController.upload,
  catchErrors(storeController.resize), 
  catchErrors(storeController.createStore)
 );
router.post('/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore));

router.get('/stores/:id/edit', catchErrors(storeController.editStore));

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);

//TODO:
// 1. validate registration
// 2. register the user
// 3. log the user in
router.post('/register', 
  userController.validateRegister,
  userController.register,
  authController.login);

router.get('/logout', authController.logout);

router.post('/login', authController.login);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', authController.isLoggedIn, userController.updateAccount);

router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token', authController.confirmedPasswords, catchErrors(authController.update));


// Do work here
//   router.get('/', (req, res) => {
//     //res.send('Hey! It works!');
// // //   //res.json(objectVariable); you can also respond with json
// // //   //res.send(req.query.queryStringName) you can also get data from url query string
//     res.render('hello', {name: "dog", money: "Dollar"});
//   });

  //Jade not pug

// router.get('reverse/:name', (req, res) => {
//   const reverse = [...req.params.name].reverse().join(''); 
//   res.send(reverse); 
//   //[...req.params.name] gets the name parameter of the req object
// })

module.exports = router;

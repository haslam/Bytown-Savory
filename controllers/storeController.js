const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true)
    }
    else {
      next({message: 'That filetype isn\'t allowed!'}, false);
    }
  }
};

exports.upload = multer(multerOptions).single('photo');

// next here is used cos we are saving the image, 
// recording the filename and pass it along to createStore
exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if(!req.file) { 
    // skip to the next middleware
    next();
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  //now resize. For jimp, you either pass it a filepath or a buffer (in memory)
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  //once photo is written to filesystem, moveon!
  next();
};

exports.homePage = (req, res) => {
    //render index template
    res.render('index', {title: 'Home'});
};

exports.addStore = (req, res) => {
    //render a view template
    res.render('editStore', { title: 'Add Store' });
};

exports.createStore = async (req, res) => {
  const store = await(new Store(req.body)).save();
  req.flash('success', `Successfully created ${store.name}. \n Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);  
}

exports.getStores = async (req, res) => {
  //1. Query the database for a list of all stores
  const stores = await Store.find();
  res.render('stores', {title: 'Stores', stores});
}

exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id });
  res.render('editStore', { title: `Edit ${store.name}`, store });
}

exports.updateStore = async (req, res) => {
  //set the location data to be a point cos update looses the point set in create schema
  req.body.location.type = 'Point';
  //find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, //return the new store instead of the old one
    runValidators: true
  }).exec();
  //redirect them to the store and tell it worked!
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/store/${store.slug}">View Store</a>`);
  res.redirect(`/stores/${store._id}/edit`);
}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug});
  if(!store) {
    return next();
  }
  res.render('store', {title: store.name, store});
}

exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag && req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({tags: tagQuery});
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  // res.json(stores);
  
  res.render('tag', { tags, stores, tag, title: 'Tags' });
}
  // try{
  //   const store = new Store(req.body);
  //   await store.save();
  // }
  // catch(err) {
  //   throw Error (err)
  // }
 

    // .save()
    // .then(store => {
    //   res.json(store);
    // })
    // .catch(err => {
    //   throw Error(err)
    // })
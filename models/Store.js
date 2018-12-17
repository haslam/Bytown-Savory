const mongoose = require('mongoose');
mongoose.Promise = global.Promise; //set mongoose promise to be global promise
const slug = require('slugs'); //allow us to make URL friendly slugs

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [
      {
        type: Number,
        required: 'Coordinates are required!'
      }
    ],
    address: {
      type: String,
      required: 'Address is required!'
    }
  },
  photo: String
});
//[String] -- an array of String

//run this function before storeSchema is saved. Use a proper function (not arrow =>) cos we need the 'this' 
storeSchema.pre('save', async function(next) {
  //
  if (!this.isModified('name')) {
    next();
    return;
  }
  //if name is modified, run the slug.
  //takes the name we passed and run it through the slug -- 
  //package and set slug property to the output of the slug package.
  this.slug = slug(this.name);  
  // find other stores with same slug
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if(storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  next(); //move along..kinda like middleware

  //TODO: make slug more resilient to unique slugs
});

// we need 'this' here hence we use proper function
storeSchema.statics.getTagsList = function() {
  return this.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: '$tags', count: { $sum: 1 }} },
      { $sort: { count: -1 }}
    ]
  );
}
module.exports = mongoose.model('Store', storeSchema);

 
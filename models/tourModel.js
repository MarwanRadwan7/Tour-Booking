const mongoose = require('mongoose');
const slugify = require('slugify');

const User = require('./userModel');

// Schema
const tourSchemaObject = {
  name: {
    type: String,
    unique: true,
    required: [true, 'A Tour must have a name.'],
    maxLength: [40, 'A Tour name must have less than 40 characters.'],
    minLength: [10, 'A Tour name must have more than 10 characters.'],
  },
  slug: String,
  duration: {
    type: String,
    required: [true, 'A Tour must have a duration'],
  },
  maxGroupSize: {
    type: String,
    required: [true, 'A Tour must have a Group Size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A Tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'A Tour must have a difficulty of easy, medium or hard',
    },
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [0, 'A Tour must have a rating above or equal 0.'],
    max: [5, 'A Tour must have a rating less or equal 5.0 .'],
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A Tour must have a price'],
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        // this keyword here only points to current doc on NEW document creation
        return val < this.price;
      },
      message: 'A Tour price ({VALUE}) must be greater than discount',
    },
  },
  summary: {
    type: String,
    trim: true, // to cut space in end and begin
    required: [true, 'A Tour must have a summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'a tour must have a image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(), // It converted in mongo from ms to normal date
    select: false, // To exclude it from the response of the client but still in th schema internally
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false,
  },
  startLocation: {
    // GeoJSON
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
    description: String,
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number,
    },
  ],
  guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
};
const tourSchema = new mongoose.Schema(tourSchemaObject, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

tourSchema.virtual('durationWeeks').get(function () {
  return Math.round(this.duration / 7);
});

// Pre Middleware runs before save/create events and not for update!
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Embedding Tour Guides
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// Query Middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// Aggregation Middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// Model
// eslint-disable-next-line new-cap
const Tour = new mongoose.model('Tour', tourSchema);

module.exports = Tour;

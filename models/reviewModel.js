const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchemaOpt = {
  review: {
    type: String,
    required: [true, 'review cannot be empty'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'review must belong to a tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'review must belong to a user'],
  },
};
const reviewSchema = mongoose.Schema(reviewSchemaOpt, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); // Unique Review

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// Static method runs on the model
reviewSchema.statics.calcAvgRating = async function (tourID) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourID },
    },
    {
      $group: {
        _id: '$tour',
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourID, {
      ratingsQuantity: stats[0].numRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourID, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAvgRating(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await Tour.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAvgRating(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

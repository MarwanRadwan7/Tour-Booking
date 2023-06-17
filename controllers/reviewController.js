const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.setUserTourIDs = (req, res, next) => {
  // Allow Nested Routes
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteOne = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);

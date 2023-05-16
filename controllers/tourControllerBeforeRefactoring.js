// eslint-disable-next-line import/extensions
const { query } = require('express');
const Tour = require('../models/tourModel.js');

// const toursData = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// Route Handlers
// This route functions is already middlewares themselves

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);

    // BUILD THE QUERY
    // 1A) Filltering
    const queryObj = { ...req.query }; // To avoid js Referencing
    const excludedFields = ['limit', 'sort', 'page', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|lt|gte|lte)\b/g, (match) => `$${match}`);

    // First way to filter the results : MongoDb filter using find(filter Object)
    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Sorting descending by default
    }

    // 3) Limit fields
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields); // Projecting
    } else {
      query = query.select('-__v');
    }

    //  4) Pagination
    const page = req.query.page * 1 || 1; // Multiplying by 1 is a trick for converting a string to a number and 1 is default value
    const limit = req.query.limit * 1 || 100; // default value for limiting is 100
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error("Page isn't exist");
    }
    // // Second way using Mongoose filter to query the filter
    // const Tours = await Tours.find()
    //   .where('difficulty')
    //   .equals('easy')
    //   .where('duration')
    //   .equals('2');

    // EXCUTE THE QUERY
    const Tours = await query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'Succeeded',
      data: Tours,
    });
  } catch (err) {
    res.status(404).json({
      status: 'Failed',
      data: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'Succeeded',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      message: 'Invalid ID!',
    });
  }
};

exports.createTour = async (req, res) => {
  // Use a try/catch with async await functions
  try {
    // This method using new object
    // const newTour = new Tour({});
    // newTour.save() ;

    const newTour = await Tour.create(req.body);

    res.status(200).json({
      status: 'Succeeded',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    // Valaidation Error to be caught
    res.status(400).json({
      status: 'Failed',
      message: 'Invalid Data sent!',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'Succeeded',
      data: {
        tour: updatedTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      data: {
        message: err,
      },
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id, {
      rawResult: true,
    });

    res.status(200).json({
      status: 'Succeeded',
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      data: {
        message: err,
      },
    });
  }
};

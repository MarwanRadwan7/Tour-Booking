const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id, {
      rawResult: true,
    });

    if (!doc) {
      return next(new AppError('No Document found with that ID!', 404));
    }

    res.status(204).json({
      status: 'Succeeded',
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDoc) {
      return next(new AppError('No Document found with that ID!', 404));
    }

    res.status(200).json({
      status: 'Succeeded',
      results: updatedDoc.length,
      data: {
        updatedDoc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'Succeeded',
      results: doc.length,
      data: {
        doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) {
      query = query.populate(popOptions);
    }
    const doc = await query;

    if (!doc) {
      return next(new AppError('No Document found with that ID!', 404));
    }

    res.status(200).json({
      status: 'Succeeded',
      results: doc.length,
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // EXECUTE THE QUERY
    const query = Model.find();
    const queryString = req.query;
    const features = new APIFeatures(query, queryString)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'Succeeded',
      results: doc.length,
      data: doc,
    });
  });

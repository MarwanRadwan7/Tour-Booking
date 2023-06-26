const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJwtError = () =>
  new AppError('Invalid token. Please, log in again!', 401);

const handleJwtExpireError = () =>
  new AppError(`Token has expired! Please, log in again!`, 401);

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // This is for Rendered Website
  else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong !',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // Programming or other unknown error: Don't leak error details
    // Log the Error
    console.error('Error', err);
    // Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }

  // Rendered Page
  if (err.isOperational) {
    return res.status(500).render('error', {
      title: 'Something went wrong !',
      msg: err.message,
    });
  }
  // Programming or other unknown error: Don't leak error details
  console.error('Error', err);
  return res.status(500).render('error', {
    title: 'Something went wrong ! Please, try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJwtError(error);
    if (err.name === 'TokenExpiredError') error = handleJwtExpireError(error);
    sendErrorProd(error, req, res);
  }

  next();
};

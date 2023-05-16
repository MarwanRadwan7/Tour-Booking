const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Middleware functions
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(helmet()); // Set security http headers

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
); // Prevent parameter pollution

const limiter = rateLimit({
  max: 100,
  window: 60 * 60 * 1000,
  message: 'Too many requests from this ip try again within an hour!',
  // standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  // legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' })); // Body Parser ; reading data from the body to req

app.use(mongoSanitize()); // Prevent noSql injection
app.use(xss()); // Prevent malicious html inject

app.use(express.static(`${__dirname}/public`)); // Serving Static files

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routers
// Mounting the Router Process
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handling Undefined Routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find "${req.originalUrl}" on this server!`, 404));
});

// Central Error Handler
app.use(globalErrorHandler);

module.exports = app;

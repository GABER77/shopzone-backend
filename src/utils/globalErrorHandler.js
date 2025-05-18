import CustomError from './customError.js';

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new CustomError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
  const match = error.errorResponse.errmsg.match(/(["'])(.*?)\1/);
  const value = match ? match[2] : 'Field';
  const message = `${value} already exists, please try a unique value`;
  return new CustomError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('; ')}`;
  return new CustomError(message, 400);
};

const handleJWTError = () =>
  new CustomError('Invalid token, Please login again', 401);

const handleJWTExpiredError = () =>
  new CustomError('Your session is expired, Please login again', 401);

const sendErrorDev = (err, req, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or 3rd party error: don't leak error details
  console.error('❌ERROR:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // 500 for internal server error
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);

    if (error.name === 'CastError') error = handleCastErrorDB(error); // Invalid data like ID
    if (error.code === 11000) error = handleDuplicateFieldsDB(error); // unUnique value
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

export default globalErrorHandler;

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // 500 for internal server error
  err.status = err.status || 'error';
};

export default globalErrorHandler;

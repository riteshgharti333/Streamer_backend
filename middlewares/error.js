export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  // Handle specific errors
  if (err.code === 11000) {
    err.message = "Duplicate Key Error";
    err.statusCode = 400;
  }

  if (err.name === "CastError") {
    err.message = "Invalid ID";
    err.statusCode = 400;
  }

  // Send error response
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    // stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Show stack only in development mode
  });
};

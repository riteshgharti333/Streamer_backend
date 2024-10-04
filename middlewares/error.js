export const errorMiddleware = (err, res) => {
  err.message = err.message || "Internal Server Error";

  err.statusCode = err.statusCode || 500;

  if (err.code === 11000) {
    (err.message = "Duplicate Key Error"), (err.statusCode = 400);
  }

  if (err.name === "CastError") {
    (err.message = "Invalid ID"), (err.statusCode = 400);
  }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default errorMiddleware;

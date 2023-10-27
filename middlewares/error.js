
export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";

    err.statusCode = err.statusCode || 500;

     // Mongoose duplicate key error
    if(err.code === 11000){
        err.message = "Duplicate Key Error",
        err.statusCode = 400
    }

    // Wrong Mongodb Id error
  if (err.name === "CastError") {
    err.message = "Invalid ID",
    err.statusCode = 400
  }

    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
    })
}

export default errorMiddleware;  
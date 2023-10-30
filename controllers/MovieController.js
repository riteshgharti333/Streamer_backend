import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Movie } from "../models/movieModel.js";
import ErrorHandler from "../utils/errorHandler.js";

export const createMovie = catchAsyncError(async (req, res, next) => {
  const newMovie = new Movie(req.body);

  const savedMovie = await newMovie.save();

  res.status(201).json({
    success: true,
    savedMovie,
  });
});

export const getAllMovies = catchAsyncError(async (req, res, next) => {
  const movies = await Movie.find();

  res.status(201).json({
    success: true,
    movies,
  });
});

export const random = catchAsyncError(async (req, res, next) => {

 const type = req.query.type;
 let movie;

 if (type === "series") {
  movie = await Movie.aggregate([
    { $match: { isSeries: true } },
    { $sample: { size: 6 } },
  ]);
} else {
  movie = await Movie.aggregate([
    { $match: { isSeries: false } },
    { $sample: { size: 6 } },
  ]);
}


res.status(200).json({
  message: true,
  movie
})
});

export const getMovie = catchAsyncError(async (req, res, next) => {
  const getMovie = await Movie.findById(req.params.id);

  if (!getMovie) return next(new ErrorHandler("Movie not found!", 404));

  res.status(200).json({
    success: true,
    getMovie,
  });
});

export const deleteMovie = catchAsyncError(async (req, res, next) => {
  const deleteMovie = await Movie.findByIdAndDelete(req.params.id);

  if (!deleteMovie) return next(new Error("Movie not found!"));

  res.status(200).json({
    success: true,
    message: "Movie Deleted",
  });
});

export const updateMovie = catchAsyncError(async (req, res, next) => {
  const updateMovie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true }
  );

  if (!updateMovie) return next(new Error("Movie not found", 404));

  res.status(200).json({
    success: true,
    updateMovie,
  });
});

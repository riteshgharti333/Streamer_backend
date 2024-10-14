import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Movie } from "../models/movieModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { removeDeletedMoviesFromAllLists } from "./ListController.js";

// CREATE MOVIE
export const createMovie = catchAsyncError(async (req, res, next) => {
  try {
    const newMovie = new Movie(req.body);

    const savedMovie = await newMovie.save();

    return res.status(201).json({
      success: true,
      savedMovie,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// GET ALL MOVIES
export const getAllMovies = catchAsyncError(async (req, res) => {
  const movies = await Movie.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    movies,
  });
});

// GET RANDOM MOVIES
export const random = catchAsyncError(async (req, res) => {
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
    movie,
  });
});

// GET SINGLE MOVIE
export const getMovie = catchAsyncError(async (req, res, next) => {
  const getMovie = await Movie.findById(req.params.id);

  if (!getMovie) return next(new ErrorHandler("Movie not found!", 404));

  res.status(200).json({
    success: true,
    getMovie,
  });
});

// DELETE MOVIE
export const deleteMovie = catchAsyncError(async (req, res, next) => {
  const movieId = req.params.id;

  const deleteMovie = await Movie.findByIdAndDelete(movieId);

  if (!deleteMovie) return next(new Error("Movie not found!", 404));

  await removeDeletedMoviesFromAllLists([movieId]);

  res.status(200).json({
    success: true,
    message: "Movie Deleted",
  });
});

// UPDATE MOVIE
export const updateMovie = catchAsyncError(async (req, res, next) => {
  const updateMovie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true },
  );

  if (!updateMovie) return next(new Error("Movie not found", 404));

  res.status(200).json({
    success: true,
    updateMovie,
  });
});

// GET GENRE MOVIES
export const queryMovie = catchAsyncError(async (req, res) => {
  const { genre, type } = req.query;

  // Build the query object
  let query = {};

  if (genre) {
    query.genre = genre;
  }

  if (type) {
    if (type === "series") {
      query.isSeries = true;
    } else if (type === "movies") {
      query.isSeries = false;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid type specified",
      });
    }
  }

  const movies = await Movie.find(query);

  if (movies.length === 0) {
    return res.status(404).json({
      success: false,
      message: `No ${type || "movies"} found for genre ${genre || "any genre"}`,
    });
  }

  res.status(200).json({
    success: true,
    movies,
  });
});

export const searchMoviesAndSeries = catchAsyncError(async (req, res, next) => {
  const { query } = req.query;

  try {
    if (!query) {
      return next(new Error("Search query is required", 400));
    }

    let isSeriesSearch = false;
    let isMovieSearch = false;

    if (query.toLowerCase().includes("series")) {
      isSeriesSearch = true;
    } 
    if (query.toLowerCase().includes("movie")) {
      isMovieSearch = true;
    }

    const searchTerm = query.replace(/series|movie/gi, "").trim();

    const searchConditions = [
      { title: { $regex: searchTerm, $options: "i" } },
      { genre: { $regex: searchTerm, $options: "i" } },
    ];

    let searchQuery = { $or: searchConditions };
    if (isSeriesSearch) {
      searchQuery.isSeries = true;
    }
    if (isMovieSearch) {
      searchQuery.isSeries = false;
    }

    const results = await Movie.find(
      searchQuery,
      "_id title genre isSeries"
    );

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No movies or series found for the query",
      });
    }

    const formattedResults = results.map((result) => ({
      id: result._id,
      title: result.title,
      genre: result.genre,
      type: result.isSeries ? "Series" : "Movie",
    }));

    res.status(200).json({
      success: true,
      results: formattedResults,
    });
  } catch (error) {
    console.error(error);
    return next(new Error("An error occurred while searching for movies and series", 500));
  }
});

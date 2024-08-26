import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { List } from "../models/listModel.js";
import { Movie } from "../models/movieModel.js";
import ErrorHandler from "../utils/errorHandler.js";

// Create a new list
export const createList = catchAsyncError(async (req, res, next) => {
  const newList = new List(req.body);

  const savedList = await newList.save();

  res.status(201).json({
    success: true,
    savedList,
  });
});

// Delete a list and remove its movie references from all lists
export const deleteList = catchAsyncError(async (req, res, next) => {
  const list = await List.findByIdAndDelete(req.params.id);

  if (!list) return next(new ErrorHandler("List not found!", 404));

  res.status(200).json({
    success: true,
    message: "List deleted and movies removed from all lists",
  });
});

// Get all lists with optional type and genre filters
export const getLists = catchAsyncError(async (req, res, next) => {
  const { type, genre } = req.query;

  // Build the query object
  let query = {};

  if (type) {
    query.type = type; // Filter by type if provided
  }

  if (genre) {
    query.genre = genre; // Filter by genre if provided
  }

  try {
    const lists = await List.find(query);

    res.status(200).json({
      success: true,
      lists,
    });
  } catch (error) {
    next(error); // Handle errors
  }
});

export const getSingleList = catchAsyncError(async (req, res, next) => {
  let list = await List.findById(req.params.id);

  if (!list) return next(new ErrorHandler("List not found!", 404));
  // await list.save();

  res.status(200).json({
    success: true,
    list,
  });
});

// Update a list, ensuring content array only includes valid movie IDs
export const updateList = catchAsyncError(async (req, res, next) => {

  const updatedList = await List.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );

  if (!updatedList) return next(new Error("List not found", 404));

  res.status(200).json({
    success: true,
    updatedList,
  });
});

export const removeDeletedMoviesFromAllLists = catchAsyncError(async (deletedMovieIds) => {
  const lists = await List.find();
  for (const list of lists) {
    list.content = list.content.filter(movieId => !deletedMovieIds.includes(movieId.toString()));
    await list.save();
  }
});

import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { List } from "../models/listModel.js";
import ErrorHandler from "../utils/errorHandler.js";

export const createList = catchAsyncError(async (req, res, next) => {
     const newList = new List(req.body);

     const savedList = await newList.save();

     res.status(201).json({
        success: true,
        savedList,
     })
});

export const updateList = catchAsyncError(async (req, res, next) => {
    
});

export const deleteList = catchAsyncError(async (req, res, next) => {
    
    const list = await List.findByIdAndDelete(req.params.id);
    
    if(!list) return next(new ErrorHandler("List not found!" , 404));

    res.status(200).json({
        success: true,
        message: "List deleted"
    })

});

export const getList = catchAsyncError(async (req, res, next) => {
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
      const movies = await List.find(query);
  
      res.status(200).json({
        success: true,
        movies,
      });
    } catch (error) {
      next(error); // Handle errors
    }
  });
  
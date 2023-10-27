import {catchAsyncError} from "../middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { sendCookie } from "../utils/features.js";
import ErrorHandler from "../utils/errorHandler.js";


export const register = catchAsyncError(async(req,res,next) => {
     const {name, email, password} = req.body;

     let user = await User.findOne({ email });

    if (user) return next(new ErrorHandler("User Already Exist", 400))

     const hashedPassword = await bcrypt.hash(password, 10);

     user = await User.create({name, email, password: hashedPassword});
     
     sendCookie(user, res, "Registered Successfully", 201);
})

export const login = catchAsyncError(async(req,res,next) => {

     const {email, password} = req.body;

     const user = await User.findOne({email}).select("+password");

     if(!user) return next(new ErrorHandler("Invalid Email or Password", 400));

     const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return next(new ErrorHandler("Invalid Email or Password", 400));

    sendCookie(user, res, `Welcome back, ${user.name}`, 200); 

     
})

export const myProfile = catchAsyncError(async(req,res,next) => {
     res.status(200).json({
          success: true,
          user: req.user,
        });
})


export const logout = catchAsyncError(async(req,res,next) => {
     res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
      secure: process.env.NODE_ENV === "Development" ? false : true,
    })
    .json({
      success: true,
      message: "Logout Successfully",
      user: req.user,
    }); 
})

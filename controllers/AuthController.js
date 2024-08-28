import {catchAsyncError} from "../middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { sendCookie } from "../utils/features.js";
import ErrorHandler from "../utils/errorHandler.js";
import { createMollieClient } from '@mollie/api-client';


const mollieClient = createMollieClient({ apiKey: 'test_HwFHQ4HSvhTAF7PMp2FpyJKfjwsJpH' });


export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("User Already Exist", 400));

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a Mollie customer
  let mollieCustomer;
  try {
    mollieCustomer = await mollieClient.customers.create({
      name,
      email,
    });
  } catch (error) {
    return next(new ErrorHandler("Error creating Mollie customer", 500));
  }

  // Create user in your database with Mollie customer ID
  user = await User.create({
    name,
    email,
    password: hashedPassword,
    customerId: mollieCustomer.id, // Save Mollie customer ID
  });

  // Send response including customer ID
  res.status(201).json({
    success: true,
    message: "Registered Successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      customerId: user.customerId, // Include customerId here
    },
    // token: generateToken(user._id), // Assuming you have a function to generate a token
  });
});



export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) return next(new ErrorHandler("Invalid Email or Password", 400));

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return next(new ErrorHandler("Invalid Email or Password", 400));

    // sendCookie(user, res, `Welcome back, ${user.name}`, 200);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

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


///

export const getCustomerIdFromUserId = catchAsyncError(async (req, res, next) => {
  const userId = req.params.userId;

  const user = await User.findById(userId);

  if (!user) return next(new ErrorHandler("User Not Found", 404));

  res.status(200).json({
    success: true,
    customerId: user.customerId,
  });
});

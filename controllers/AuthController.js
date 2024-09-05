import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { sendCookie } from "../utils/features.js";
import ErrorHandler from "../utils/errorHandler.js";
import Subscription from "../models/subscriptionModel.js";


// REGISTER 

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password, isAdmin } = req.body;

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("User Already Exist", 400));

  const hashedPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    name,
    email,
    password: hashedPassword,
    isAdmin,
  });

  res.status(201).json({
    success: true,
    message: "Registered Successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
  });
});

// LOGIN

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) return next(new ErrorHandler("Invalid Email or Password", 400));

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return next(new ErrorHandler("Invalid Email or Password", 400));

    sendCookie(user, res, `Welcome Back, ${user.name}`, 200);
  } catch (error) {
    next(error);
  }
};

// PROFILE

export const myProfile = catchAsyncError(async (req, res, next) => {
  try {
    const user = req.user;
    const subscription = await Subscription.findOne({ userId: user._id });

    res.status(200).json({
      success: true,
      userDetails: {
        user,
        subscription: subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});



// LOGOUT

export const logout = catchAsyncError(async (req, res, next) => {
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
});


import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { sendCookie } from "../utils/features.js";
import ErrorHandler from "../utils/errorHandler.js";
import Subscription from "../models/subscriptionModel.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

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

    if (!user) {
      return res.status(400).json({ message: 'Invalid Email or Password' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Email or Password' });
    }

    sendCookie(user, res, `Login Successfully`, 200);
  } catch (error) {
    next(error);
  }
};

// PROFILE

export const myProfile = catchAsyncError(async (req, res, next) => {
  try {
    const user = req.user;
    const subscription = await Subscription.find({ userId: user._id });

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

export const logout = catchAsyncError(async (req, res) => {
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

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new ErrorHandler("User not found!", 404));
  }

  // Update name if provided
  if (req.body.name) {
    user.name = req.body.name;
  }

  // Check if the email is being updated and ensure it's not already in use
  if (req.body.email && req.body.email !== user.email) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }
    user.email = req.body.email;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: req.user,
  });
});

export const updatePassword = catchAsyncError(async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) return next(new ErrorHandler("User not found!", 404));

    const { currentPassword, newPassword } = req.body;

    // Check if the current password matches the one in the database
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return next(new ErrorHandler("Invalid current password", 400));

    // Check if the new password is the same as the current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword)
      return next(
        new ErrorHandler(
          "New password cannot be the same as the current password",
          400,
        ),
      );

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    // Save the updated user with the new password
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// FORGOT PASSWORD

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) return next(new ErrorHandler("User not found", 400));

    const secret = process.env.JWT_SECRET;

    const token = jwt.sign({ email: user.email, id: user._id }, secret, {
      expiresIn: "30m",
    });

    const modifiedToken = token.replace(/\./g, "_");

    const link = `${process.env.FRONTEND_URL}/reset-password/${user._id}/${modifiedToken}`;


    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    var mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      html: `
      <p>Hello ${user.name || "User"},</p>
      
      <p>We received a request to reset your password for your account associated with this email address: ${
        user.email
      }.</p>
      
      <p>To reset your password, please click the button below:</p>
      
      <p>
        <a href="${link}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </p>
  
      <p>If you did not request a password reset, please ignore this email. Your password will not be changed until you click the button above and create a new password.</p>
  
      <p>For security reasons, this link will expire in 30 minutes. If you need a new password reset link, you can request another one through the password reset page.</p>
  
      <p>If you have any questions or need further assistance, please don’t hesitate to reach out.</p>
  
      <p>Thank you,<br/>Streamer</p>
    `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to send email." });
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({
          message:
            "Please check your email, a reset link has been sent to you.",
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

// RESET PASSWORD
export const resetPassword = catchAsyncError(async (req, res, next) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   

    const modifiedToken = token.replace(/_/g, ".");


    const secret = process.env.JWT_SECRET;

    // console.log(token)
    try {
      jwt.verify(modifiedToken,secret);
    } catch (err) {
      console.log(err);
      return next(new ErrorHandler("Invalid or expired token", 401));
    }

    const encryptPassword = await bcrypt.hash(password, 10);

    await User.updateOne({ _id: id }, { $set: { password: encryptPassword } });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

export const isAdmin = (req, res, next) => {
  // Check if the user exists and their role is 'admin'
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, proceed to the next middleware or route handler
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only admins can perform this action.",
    });
  }
};

const jwt = require("jsonwebtoken")
const asyncHandler = require("./asyncHandler")
const User = require("../models/User")

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1]
  }
  // Set token from cookie
  else if (req.cookies.token) {
    token = req.cookies.token
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    })
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id)

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      })
    }

    next()
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    })
  }
})

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      })
    }
    next()
  }
}

// Check specific permissions
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user.permissions[resource] || !req.user.permissions[resource][action]) {
      return res.status(403).json({
        success: false,
        message: `You don't have permission to ${action} ${resource}`,
      })
    }
    next()
  }
}

// Optional auth - doesn't fail if no token
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  } else if (req.cookies.token) {
    token = req.cookies.token
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id)
    } catch (err) {
      // Token is invalid, but we don't fail the request
      req.user = null
    }
  }

  next()
})

module.exports = {
  protect,
  authorize,
  checkPermission,
  optionalAuth,
}

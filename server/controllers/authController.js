const crypto = require("crypto")
const User = require("../models/User")
const asyncHandler = require("../middleware/asyncHandler")

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, department } = req.body

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists with this email",
    })
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || "user",
    phone,
    department,
  })

  sendTokenResponse(user, 201, res)
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide an email and password",
    })
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password")

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    })
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: "Account is deactivated. Please contact administrator",
    })
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password)
console.log("Password match result:", isMatch)
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    })
  }

  // Update last login
  user.lastLogin = new Date()
  await user.save()

  sendTokenResponse(user, 200, res)
})

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  })

  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  })
})

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
const updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    department: req.body.department,
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("+password")

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return res.status(401).json({
      success: false,
      message: "Password is incorrect",
    })
  }

  user.password = req.body.newPassword
  await user.save()

  sendTokenResponse(user, 200, res)
})

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "There is no user with that email",
    })
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken()

  await user.save({ validateBeforeSave: false })

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/resetpassword/${resetToken}`

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`

  try {
    // Here you would send email with reset link
    // For now, we'll just return the reset token in development
    if (process.env.NODE_ENV === "development") {
      res.status(200).json({
        success: true,
        message: "Email sent",
        resetToken, // Only in development
      })
    } else {
      res.status(200).json({
        success: true,
        message: "Email sent",
      })
    }
  } catch (err) {
    console.log(err)
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save({ validateBeforeSave: false })

    return res.status(500).json({
      success: false,
      message: "Email could not be sent",
    })
  }
})

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex")

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid token",
    })
  }

  // Set new password
  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  sendTokenResponse(user, 200, res)
})

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  // Build filter object
  const filter = {}
  if (req.query.role) filter.role = req.query.role
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true"
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
      { department: { $regex: req.query.search, $options: "i" } },
    ]
  }

  const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)

  const total = await User.countDocuments(filter)

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: users,
  })
})

// @desc    Get single user (Admin only)
// @route   GET /api/auth/users/:id
// @access  Private/Admin
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    })
  }

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Create user (Admin only)
// @route   POST /api/auth/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body)

  res.status(201).json({
    success: true,
    data: user,
  })
})

// @desc    Update user (Admin only)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    })
  }

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    })
  }

  // Don't allow deletion of the last admin
  if (user.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin", isActive: true })
    if (adminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete the last admin user",
      })
    }
  }

  await User.findByIdAndDelete(req.params.id)

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  })
})

// @desc    Deactivate/Activate user (Admin only)
// @route   PUT /api/auth/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    })
  }

  // Don't allow deactivation of the last admin
  if (user.role === "admin" && user.isActive) {
    const activeAdminCount = await User.countDocuments({ role: "admin", isActive: true })
    if (activeAdminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot deactivate the last admin user",
      })
    }
  }

  user.isActive = !user.isActive
  await user.save()

  res.status(200).json({
    success: true,
    data: user,
    message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
  })
})

// @desc    Get user statistics (Admin only)
// @route   GET /api/auth/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments()
  const activeUsers = await User.countDocuments({ isActive: true })
  const inactiveUsers = await User.countDocuments({ isActive: false })

  // Users by role
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ])

  // Recent registrations (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentRegistrations = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  })

  // Users by department
  const usersByDepartment = await User.aggregate([
    {
      $match: { department: { $ne: null, $ne: "" } },
    },
    {
      $group: {
        _id: "$department",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ])

  res.status(200).json({
    success: true,
    data: {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      recentRegistrations,
      usersByRole,
      usersByDepartment,
    },
  })
})

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken()
  console.log("Generated JWT Token:", token)

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
  }

  if (process.env.NODE_ENV === "production") {
    options.secure = true
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive,
        phone: user.phone,
        department: user.department,
        lastLogin: user.lastLogin,
      },
    })
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
}

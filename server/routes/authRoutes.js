const express = require("express")
const {
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
} = require("../controllers/authController")

const { protect, authorize } = require("../middleware/auth")

const router = express.Router()

// Public routes
router.post("/register", register)
router.post("/login", login)
// router.post("/forgotpassword", forgotPassword)
// router.put("/resetpassword/:resettoken", resetPassword)

// // Protected routes
// router.get("/logout", logout)
// router.get("/me", protect, getMe)
// router.put("/updatedetails", protect, updateDetails)
// router.put("/updatepassword", protect, updatePassword)

// // Admin only routes
// router.use(protect) // All routes below require authentication
// router.use(authorize("admin")) // All routes below require admin role

// router.route("/users").get(getUsers).post(createUser)

// router.route("/stats").get(getUserStats)

// router.route("/users/:id").get(getUser).put(updateUser).delete(deleteUser)

// router.route("/users/:id/toggle-status").put(toggleUserStatus)

module.exports = router

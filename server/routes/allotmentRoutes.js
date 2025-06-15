const express = require("express")
const {
  getAllotments,
  getAllotment,
  createAllotment,
  updateAllotment,
  extendAllotment,
  returnAllotment,
  getOverdueAllotments,
  getAllotmentStats,
} = require("../controllers/allotmentController")

const { protect, checkPermission } = require("../middleware/auth")

// Import bulk routes
const bulkRoutes = require("./bulkAllotmentRoutes")

const router = express.Router()

// Use bulk routes
router.use("/", bulkRoutes)

// Regular allotment routes
router
  .route("/")
  .get(protect, checkPermission("allotments", "read"), getAllotments)
  .post(protect, checkPermission("allotments", "write"), createAllotment)

router.route("/stats").get(protect, checkPermission("allotments", "read"), getAllotmentStats)

router.route("/overdue").get(protect, checkPermission("allotments", "read"), getOverdueAllotments)

router
  .route("/:id")
  .get(protect, checkPermission("allotments", "read"), getAllotment)
  .put(protect, checkPermission("allotments", "write"), updateAllotment)

router.route("/:id/extend").post(protect, checkPermission("allotments", "write"), extendAllotment)

router.route("/:id/return").post(protect, checkPermission("allotments", "write"), returnAllotment)

module.exports = router

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

// Import bulk routes
const bulkRoutes = require("./bulkAllotmentRoutes")

const router = express.Router()

// Use bulk routes
router.use("/", bulkRoutes)

// Regular allotment routes
router
  .route("/")
  .get(getAllotments)
  .post(createAllotment)

router.route("/stats").get(getAllotmentStats)

router.route("/overdue").get(getOverdueAllotments)

router
  .route("/:id")
  .get(getAllotment)
  .put(updateAllotment)

router.route("/:id/extend").post(extendAllotment)

router.route("/:id/return").post(returnAllotment)

module.exports = router

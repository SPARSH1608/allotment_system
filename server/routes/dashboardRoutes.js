const express = require("express")
const {
  getDashboardStats,
  getRecentActivities,
  getAllotmentTrends,
  getOrganizationDistribution,
} = require("../controllers/dashboardController")

const router = express.Router()

router.route("/stats").get(getDashboardStats)

router.route("/activities").get(getRecentActivities)

router.route("/trends").get(getAllotmentTrends)

router.route("/organization-distribution").get(getOrganizationDistribution)

module.exports = router

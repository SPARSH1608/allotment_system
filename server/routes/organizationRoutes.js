const express = require("express")
const {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats,
} = require("../controllers/organizationController")

const router = express.Router()

router.route("/").get(getOrganizations).post(createOrganization)

router.route("/stats").get(getOrganizationStats)

router.route("/:id").get(getOrganization).put(updateOrganization).delete(deleteOrganization)

module.exports = router

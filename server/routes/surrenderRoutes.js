const express = require("express")
const {
  getSurrenderRecords,
  getSurrenderRecord,
  createSurrenderRecord,
  updateSurrenderRecord,
  deleteSurrenderRecord,
  getSurrenderStats,
} = require("../controllers/surrenderController")

const router = express.Router()

router.route("/").get(getSurrenderRecords).post(createSurrenderRecord)

router.route("/stats").get(getSurrenderStats)

router.route("/:id").get(getSurrenderRecord).put(updateSurrenderRecord).delete(deleteSurrenderRecord)

module.exports = router

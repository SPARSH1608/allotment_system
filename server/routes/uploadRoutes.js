const express = require("express")
const { upload, uploadProducts, uploadOrganizations, downloadTemplate } = require("../controllers/uploadController")

const router = express.Router()

router.route("/products").post(upload.single("file"), uploadProducts)

router.route("/organizations").post(upload.single("file"), uploadOrganizations)

router.route("/template/:type").get(downloadTemplate)

module.exports = router

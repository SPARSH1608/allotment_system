const express = require("express")
const multer = require("multer")
const {
  previewBulkAllotments,
  processBulkAllotments,
  getBulkUploadHistory,
  getBulkUploadStatus,
  downloadBulkTemplate,
} = require("../controllers/bulkAllotmentController")

const { protect, checkPermission } = require("../middleware/auth")

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true)
    } else {
      cb(new Error("Only Excel files (.xlsx, .xls) are allowed"), false)
    }
  },
})

// Bulk upload routes
router
  .route("/bulk-preview")
  .post(protect, checkPermission("allotments", "write"), previewBulkAllotments)

router
  .route("/bulk-upload")
  .post( processBulkAllotments)

router.route("/bulk-history").get(protect, checkPermission("allotments", "read"), getBulkUploadHistory)

router.route("/bulk-status/:uploadId").get(protect, checkPermission("allotments", "read"), getBulkUploadStatus)

router.route("/bulk-template").get(protect, checkPermission("allotments", "read"), downloadBulkTemplate)

module.exports = router

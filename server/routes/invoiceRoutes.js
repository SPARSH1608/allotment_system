const express = require("express")
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  markInvoicePaid,
  generateInvoicePDF,
  sendInvoice,
  deleteInvoice,
  getInvoiceStats,
  getCompanySettings,
  updateCompanySettings,
} = require("../controllers/invoiceController")

const { protect, checkPermission } = require("../middleware/auth")

const router = express.Router()

router
  .route("/")
  .get( getInvoices)
  .post( createInvoice)

router.route("/stats").get(protect, checkPermission("invoices", "read"), getInvoiceStats)

router
  .route("/company-settings")
  .get(protect, checkPermission("invoices", "read"), getCompanySettings)
  .put(protect, checkPermission("invoices", "write"), updateCompanySettings)

router
  .route("/:invoiceNumber")
  .get(protect, checkPermission("invoices", "read"), getInvoice)
  .put(protect, checkPermission("invoices", "write"), updateInvoice)
  .delete(protect, checkPermission("invoices", "delete"), deleteInvoice)

router.route("/:invoiceNumber/pay").post(protect, checkPermission("invoices", "write"), markInvoicePaid)

router.route("/:invoiceNumber/send").post(protect, checkPermission("invoices", "write"), sendInvoice)

router.route("/:invoiceNumber/pdf").get(protect, checkPermission("invoices", "read"), generateInvoicePDF)

module.exports = router
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

const router = express.Router()

router
  .route("/")
  .get(getInvoices)
  .post(createInvoice)

router.route("/stats").get(getInvoiceStats)

router
  .route("/company-settings")
  .get(getCompanySettings)
  .put(updateCompanySettings)

router
  .route("/:invoiceNumber")
  .get(getInvoice)
  .put(updateInvoice)
  .delete(deleteInvoice)

router.route("/:invoiceNumber/pay").post(markInvoicePaid)

router.route("/:invoiceNumber/send").post(sendInvoice)

router.route("/:invoiceNumber/pdf").get(generateInvoicePDF)

module.exports = router
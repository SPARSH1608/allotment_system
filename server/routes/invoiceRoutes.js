const express = require("express")
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  markInvoicePaid,
  sendInvoice,
  deleteInvoice,
  getInvoiceStats,
} = require("../controllers/invoiceController")

const router = express.Router()

router.route("/").get(getInvoices).post(createInvoice)

router.route("/stats").get(getInvoiceStats)

router.route("/:invoiceNumber").get(getInvoice).put(updateInvoice).delete(deleteInvoice)

router.route("/:invoiceNumber/pay").post(markInvoicePaid)

router.route("/:invoiceNumber/send").post(sendInvoice)

module.exports = router

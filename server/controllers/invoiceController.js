const Invoice = require("../models/Invoice")
const Organization = require("../models/Organization")
const Product = require("../models/Product")
const Allotment = require("../models/Allotment")
const asyncHandler = require("../middleware/asyncHandler")

// Default company details (should be configurable)
const DEFAULT_COMPANY_DETAILS = {
  name: "TechRent Solutions Pvt Ltd",
  address: "123 Business Park, Tech City, State - 123456",
  mobileNumber: "+91-9876543210",
  gstin: "29ABCDE1234F1Z5",
  bankDetails: {
    bankName: "State Bank of India",
    bankAddress: "Main Branch, Tech City",
    accountNumber: "1234567890123456",
    ifscCode: "SBIN0001234",
  },
}

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Public
const getInvoices = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  // Build filter object
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.organizationName) {
    filter["organizationDetails.name"] = { $regex: req.query.organizationName, $options: "i" }
  }
  if (req.query.search) {
    filter.$or = [
      { invoiceNumber: { $regex: req.query.search, $options: "i" } },
      { "organizationDetails.name": { $regex: req.query.search, $options: "i" } },
      { "organizationDetails.contactPerson": { $regex: req.query.search, $options: "i" } },
    ]
  }

  const invoices = await Invoice.find(filter).sort({ invoiceDate: -1 }).skip(skip).limit(limit)

  const total = await Invoice.countDocuments(filter)

  res.status(200).json({
    success: true,
    count: invoices.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: invoices,
  })
})

// @desc    Get single invoice
// @route   GET /api/invoices/:invoiceNumber
// @access  Public
const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ invoiceNumber: req.params.invoiceNumber })

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: "Invoice not found",
    })
  }

  res.status(200).json({
    success: true,
    data: invoice,
  })
})

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Public
const createInvoice = asyncHandler(async (req, res) => {
  // Accept items[] instead of selectedProducts[]
  const {
    organizationId,
    invoiceDate,
    dueDate,
    items = [],
    sgstRate = 9,
    cgstRate = 9,
    notes,
    companyDetails,
    subtotal,
    sgstAmount,
    cgstAmount,
    totalTaxAmount,
    grandTotal,
  } = req.body

  // Get organization details
  const organization = await Organization.findOne({ id: organizationId })
  if (!organization) {
    return res.status(404).json({
      success: false,
      message: "Organization not found",
    })
  }

  // Build organizationDetails as per schema
  const organizationDetails = {
    id: organization.id,
    name: organization.name,
    location: organization.location,
    contactPerson: organization.contactPerson,
    contactEmail: organization.contactEmail,
    contactPhone: organization.contactPhone,
    gstin: organization.gstin || "",
  }

  // Generate invoice number
  const count = await Invoice.countDocuments()
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`

  // Build invoice items from items array, fetching product details
  const invoiceItems = []
  for (const item of items) {
    const { productId, quantity, startDate, endDate, ratePerDay, totalAmount, description } = item
    const product = await Product.findOne({ id: productId })
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product ${productId} not found`,
      })
    }
    invoiceItems.push({
      productId,
      model: product.model,
      serialNumber: product.serialNumber,
      company: product.company,
      processor: product.processor,
      processorGen: product.processorGen,
      ram: product.ram,
      ssd: product.ssd,
      hdd: product.hdd,
      windowsVersion: product.windowsVersion,
      quantity,
      startDate,
      endDate,
      ratePerDay,
      totalAmount,
      description: description || `${product.company} ${product.model} - ${product.processor} ${product.ram}GB RAM ${product.ssd}GB SSD`,
    })
  }

  // Use provided company details or default
  const finalCompanyDetails = companyDetails || DEFAULT_COMPANY_DETAILS

  // Calculate due date if not provided
  const invoiceDateObj = invoiceDate ? new Date(invoiceDate) : new Date()
  const calculatedDueDate = dueDate ? new Date(dueDate) : new Date(invoiceDateObj.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Determine status based on due date
  let status = "Draft"
  const now = new Date()
  if (calculatedDueDate < now) {
    status = "Overdue"
  }

  // Create invoice
  const invoice = await Invoice.create({
    invoiceNumber,
    invoiceDate: invoiceDateObj,
    dueDate: calculatedDueDate,
    companyDetails: finalCompanyDetails,
    organizationDetails,
    items: invoiceItems,
    subtotal,
    sgstRate,
    sgstAmount,
    cgstRate,
    cgstAmount,
    totalTaxAmount,
    grandTotal,
    notes,
    status, // use computed status
  })

  res.status(201).json({
    success: true,
    data: invoice,
  })
})

// @desc    Update invoice
// @route   PUT /api/invoices/:invoiceNumber
// @access  Public
const updateInvoice = asyncHandler(async (req, res) => {
  let invoice = await Invoice.findOne({ invoiceNumber: req.params.invoiceNumber })

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: "Invoice not found",
    })
  }

  // Don't allow updates to paid invoices
  if (invoice.status === "Paid") {
    return res.status(400).json({
      success: false,
      message: "Cannot update paid invoice",
    })
  }

  invoice = await Invoice.findOneAndUpdate({ invoiceNumber: req.params.invoiceNumber }, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: invoice,
  })
})

// @desc    Mark invoice as paid
// @route   POST /api/invoices/:invoiceNumber/pay
// @access  Public
const markInvoicePaid = asyncHandler(async (req, res) => {
  const { paymentDate, paymentMethod } = req.body

  const invoice = await Invoice.findOne({ invoiceNumber: req.params.invoiceNumber })

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: "Invoice not found",
    })
  }

  if (invoice.status === "Paid") {
    return res.status(400).json({
      success: false,
      message: "Invoice already paid",
    })
  }

  invoice.status = "Paid"
  invoice.paymentDate = paymentDate || new Date()
  invoice.paymentMethod = paymentMethod

  await invoice.save()

  res.status(200).json({
    success: true,
    data: invoice,
    message: "Invoice marked as paid",
  })
})

// @desc    Generate invoice PDF
// @route   GET /api/invoices/:invoiceNumber/pdf
// @access  Public
const generateInvoicePDF = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ invoiceNumber: req.params.invoiceNumber })

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: "Invoice not found",
    })
  }

  // Here you would integrate with a PDF generation library like puppeteer or jsPDF
  // For now, we'll return the invoice data formatted for PDF generation

  res.status(200).json({
    success: true,
    data: {
      invoice,
      pdfUrl: `/api/invoices/${invoice.invoiceNumber}/download`,
    },
    message: "Invoice PDF generated successfully",
  })
})

// @desc    Send invoice
// @route   POST /api/invoices/:invoiceNumber/send
// @access  Public
const sendInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ invoiceNumber: req.params.invoiceNumber })

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: "Invoice not found",
    })
  }

  if (invoice.status === "Draft") {
    invoice.status = "Sent"
    await invoice.save()
  }

  // Here you would integrate with email service to send the invoice
  // For now, we'll just return success

  res.status(200).json({
    success: true,
    data: invoice,
    message: "Invoice sent successfully",
  })
})

// @desc    Delete invoice
// @route   DELETE /api/invoices/:invoiceNumber
// @access  Public
const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ invoiceNumber: req.params.invoiceNumber })

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: "Invoice not found",
    })
  }

  // Don't allow deletion of paid invoices
  if (invoice.status === "Paid") {
    return res.status(400).json({
      success: false,
      message: "Cannot delete paid invoice",
    })
  }

  await Invoice.findOneAndDelete({ invoiceNumber: req.params.invoiceNumber })

  res.status(200).json({
    success: true,
    message: "Invoice deleted successfully",
  })
})

// @desc    Get invoice statistics
// @route   GET /api/invoices/stats
// @access  Public
const getInvoiceStats = asyncHandler(async (req, res) => {
  const totalInvoices = await Invoice.countDocuments()
  const paidInvoices = await Invoice.countDocuments({ status: "Paid" })
  const pendingInvoices = await Invoice.countDocuments({ status: "Sent" })
  const overdueInvoices = await Invoice.countDocuments({
    status: "Sent",
    dueDate: { $lt: new Date() },
  })

  // Update overdue invoices
  await Invoice.updateMany(
    {
      status: "Sent",
      dueDate: { $lt: new Date() },
    },
    { status: "Overdue" },
  )

  // Revenue statistics
  const revenueStats = await Invoice.aggregate([
    {
      $match: { status: "Paid" },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$grandTotal" },
        totalTax: { $sum: "$totalTaxAmount" },
        totalSubtotal: { $sum: "$subtotal" },
      },
    },
  ])

  // Monthly revenue trends
  const monthlyRevenue = await Invoice.aggregate([
    {
      $match: { status: "Paid" },
    },
    {
      $group: {
        _id: {
          year: { $year: "$paymentDate" },
          month: { $month: "$paymentDate" },
        },
        revenue: { $sum: "$grandTotal" },
        invoiceCount: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": -1, "_id.month": -1 },
    },
    {
      $limit: 12,
    },
  ])

  res.status(200).json({
    success: true,
    data: {
      total: totalInvoices,
      paid: paidInvoices,
      pending: pendingInvoices,
      overdue: overdueInvoices,
      revenue: revenueStats[0] || { totalRevenue: 0, totalTax: 0, totalSubtotal: 0 },
      monthlyRevenue,
    },
  })
})

// @desc    Get company settings
// @route   GET /api/invoices/company-settings
// @access  Public
const getCompanySettings = asyncHandler(async (req, res) => {
  // In a real application, this would come from a settings table
  res.status(200).json({
    success: true,
    data: DEFAULT_COMPANY_DETAILS,
  })
})

// @desc    Update company settings
// @route   PUT /api/invoices/company-settings
// @access  Public
const updateCompanySettings = asyncHandler(async (req, res) => {
  // In a real application, this would update a settings table
  // For now, we'll just return the updated settings
  res.status(200).json({
    success: true,
    data: req.body,
    message: "Company settings updated successfully",
  })
})

module.exports = {
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
}

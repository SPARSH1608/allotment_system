const Invoice = require("../models/Invoice")
const Organization = require("../models/Organization")
const Product = require("../models/Product")
const Allotment = require("../models/Allotment")
const asyncHandler = require("../middleware/asyncHandler")

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
  if (req.query.organizationId) filter.organizationId = req.query.organizationId
  if (req.query.search) {
    filter.$or = [
      { invoiceNumber: { $regex: req.query.search, $options: "i" } },
      { billingPeriod: { $regex: req.query.search, $options: "i" } },
    ]
  }

  const invoices = await Invoice.find(filter)
    .populate({
      path: "organizationId",
      model: "Organization",
      select: "id name location contactPerson",
    })
    .sort({ invoiceDate: -1 })
    .skip(skip)
    .limit(limit)

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
    .populate("organizationId")
    .populate({
      path: "items.laptopId",
      model: "Product",
      select: "id model company processor ram ssd",
    })

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
  const { organizationId, selectedLaptops, billingPeriod, dueDate, taxRate, discountRate, notes } = req.body

  // Check if organization exists
  const organization = await Organization.findOne({ id: organizationId })
  if (!organization) {
    return res.status(404).json({
      success: false,
      message: "Organization not found",
    })
  }

  // Generate invoice number
  const count = await Invoice.countDocuments()
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`

  // Build invoice items from selected laptops
  const items = []
  let subtotal = 0

  for (const laptopId of selectedLaptops) {
    // Get laptop details
    const laptop = await Product.findOne({ id: laptopId })
    if (!laptop) {
      return res.status(404).json({
        success: false,
        message: `Laptop ${laptopId} not found`,
      })
    }

    // Get current allotment for this laptop and organization
    const allotment = await Allotment.findOne({
      laptopId,
      organizationId,
      status: { $in: ["Active", "Extended", "Overdue"] },
    })

    if (!allotment) {
      return res.status(400).json({
        success: false,
        message: `No active allotment found for laptop ${laptopId}`,
      })
    }

    const rate = allotment.currentMonthRent
    const amount = rate * 1 // quantity is always 1 for laptops

    items.push({
      laptopId,
      description: `${laptop.company} ${laptop.model} - ${laptop.processor} ${laptop.ram} ${laptop.ssd}`,
      quantity: 1,
      rate,
      amount,
    })

    subtotal += amount
  }

  // Calculate due date if not provided
  const invoiceDate = new Date()
  const calculatedDueDate = dueDate ? new Date(dueDate) : new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000)

  const invoice = await Invoice.create({
    invoiceNumber,
    organizationId,
    invoiceDate,
    dueDate: calculatedDueDate,
    billingPeriod,
    items,
    subtotal,
    taxRate: taxRate || 18,
    discountRate: discountRate || 0,
    notes,
    status: "Draft",
  })

  const populatedInvoice = await Invoice.findById(invoice._id).populate("organizationId").populate({
    path: "items.laptopId",
    model: "Product",
    select: "id model company",
  })

  res.status(201).json({
    success: true,
    data: populatedInvoice,
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
  }).populate("organizationId")

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
        totalRevenue: { $sum: "$totalAmount" },
        totalTax: { $sum: "$taxAmount" },
        totalDiscount: { $sum: "$discountAmount" },
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
        revenue: { $sum: "$totalAmount" },
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
      revenue: revenueStats[0] || { totalRevenue: 0, totalTax: 0, totalDiscount: 0 },
      monthlyRevenue,
    },
  })
})

module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  markInvoicePaid,
  sendInvoice,
  deleteInvoice,
  getInvoiceStats,
}

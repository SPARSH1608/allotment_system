const Allotment = require("../models/Allotment")
const Product = require("../models/Product")
const Organization = require("../models/Organization")
const asyncHandler = require("../middleware/asyncHandler")
const moment = require("moment")

// @desc    Get all allotments
// @route   GET /api/allotments
// @access  Public
const getAllotments = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit
console.log('req.query:', req.query)
  // Build filter object
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.organizationId) filter.organizationId = req.query.organizationId
  if (req.query.laptopId) filter.laptopId = req.query.laptopId
console.log("Filter:", filter)
if (req.query.laptopId) {
  // Convert your custom "id" to Mongo _id
  const product = await Product.findOne({ id: req.query.laptopId });
  if (!product) {
    return res.status(404).json({ success: false, message: "Laptop not found" });
  }
  filter.laptopId = product._id;
}
  const allotments = await Allotment.find(filter)
    .populate({
      path: "laptopId",
      model: "Product",
      select: "id model company processor ram ssd",
    })
    .populate({
      path: "organizationId",
      model: "Organization",
      select: "id name location contactPerson",
    })
    .sort({ handoverDate: -1 })
    .skip(skip)
    .limit(limit)

  const total = await Allotment.countDocuments(filter)

  res.status(200).json({
    success: true,
    count: allotments.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: allotments,
  })
})

// @desc    Get single allotment
// @route   GET /api/allotments/:id
// @access  Public
const getAllotment = asyncHandler(async (req, res) => {
  const allotment = await Allotment.findOne({ _id: req.params.id }).populate("laptopId").populate("organizationId")

  if (!allotment) {
    return res.status(404).json({
      success: false,
      message: "Allotment not found",
    })
  }

  res.status(200).json({
    success: true,
    data: allotment,
  })
})

// @desc    Create new allotment
// @route   POST /api/allotments
// @access  Public
const createAllotment = asyncHandler(async (req, res) => {
  const { laptopId, organizationId } = req.body

  // Check if laptop exists and is available
  const laptop = await Product.findOne({ _id: laptopId })
  if (!laptop) {
    return res.status(404).json({
      success: false,
      message: "Laptop not found",
    })
  }
console.log("Laptop found:", laptop)
  if (laptop.status !== "Available") {
    return res.status(400).json({
      success: false,
      message: "Laptop is not available for allotment",
    })
  }

  // Check if organization exists
  const organization = await Organization.findOne({ _id: organizationId })
  if (!organization) {
    return res.status(404).json({
      success: false,
      message: "Organization not found",
    })
  }

  // Generate allotment ID if not provided
  if (!req.body.id) {
    const count = await Allotment.countDocuments()
    req.body.id = `ALT${String(count + 1).padStart(4, "0")}`
  }

  // Set default rent if not provided
  if (!req.body.rentPer30Days) {
    req.body.rentPer30Days = laptop.baseRent
  }

  const allotment = await Allotment.create(req.body)

  // Update laptop status and current allotment
  await Product.findOneAndUpdate(
    { _id: laptopId },
    {
      status: "Allotted",
      currentAllotmentId: allotment._id,
    },
  )

  // Update organization stats
  await Organization.findOneAndUpdate(
    { _id: organizationId },
    {
      $inc: {
        totalAllotments: 1,
        activeAllotments: 1,
      },
    },
  )

  const populatedAllotment = await Allotment.findById(allotment._id).populate("laptopId").populate("organizationId")

  res.status(201).json({
    success: true,
    data: populatedAllotment,
  })
})

// @desc    Update allotment
// @route   PUT /api/allotments/:id
// @access  Public
const updateAllotment = asyncHandler(async (req, res) => {
  let allotment = await Allotment.findOne({ _id: req.params.id })

  if (!allotment) {
    return res.status(404).json({
      success: false,
      message: "Allotment not found",
    })
  }

  allotment = await Allotment.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("laptopId")
    .populate("organizationId")

  res.status(200).json({
    success: true,
    data: allotment,
  })
})

// @desc    Extend allotment
// @route   POST /api/allotments/:id/extend
// @access  Public
const extendAllotment = asyncHandler(async (req, res) => {
  const { extensionDays, newRent, notes } = req.body

  const allotment = await Allotment.findOne({ _id: req.params.id })

  if (!allotment) {
    return res.status(404).json({
      success: false,
      message: "Allotment not found",
    })
  }

  if (allotment.status !== "Active") {
    return res.status(400).json({
      success: false,
      message: "Can only extend active allotments",
    })
  }

  const previousDueDate = allotment.dueDate
  const newDueDate = new Date(previousDueDate.getTime() + extensionDays * 24 * 60 * 60 * 1000)
console.log("Previous Due Date:", previousDueDate)
console.log("New Due Date:", newDueDate)
  // Add to extension history
  allotment.extensionHistory.push({
    extensionDate: new Date(),
    previousDueDate,
    newDueDate,
    additionalDays: extensionDays,
    notes,
  })

  // Update allotment
  allotment.dueDate = newDueDate
  allotment.currentMonthDays += extensionDays
  if (newRent) {
    allotment.rentPer30Days = newRent
  }
  allotment.status = "Extended"

  await allotment.save()

  res.status(200).json({
    success: true,
    data: allotment,
    message: "Allotment extended successfully",
  })
})

// @desc    Return allotment (mark as returned)
// @route   POST /api/allotments/:id/return
// @access  Public
const returnAllotment = asyncHandler(async (req, res) => {
  const { returnDate, condition, returnNotes } = req.body

  const allotment = await Allotment.findOne({ _id: req.params.id })

  if (!allotment) {
    return res.status(404).json({
      success: false,
      message: "Allotment not found",
    })
  }

  if (allotment.status === "Returned") {
    return res.status(400).json({
      success: false,
      message: "Allotment already returned",
    })
  }

  // Update allotment
  allotment.surrenderDate = returnDate || new Date()
  allotment.status = "Returned"
  allotment.notes = returnNotes || allotment.notes

  await allotment.save()

  // Update laptop status
  await Product.findOneAndUpdate(
    { id: allotment.laptopId },
    {
      status: "Available",
      currentAllotmentId: null,
    },
  )

  // Update organization stats
  await Organization.findOneAndUpdate(
    { id: allotment.organizationId },
    {
      $inc: { activeAllotments: -1 },
    },
  )

  res.status(200).json({
    success: true,
    data: allotment,
    message: "Allotment returned successfully",
  })
})

// @desc    Get overdue allotments
// @route   GET /api/allotments/overdue
// @access  Public
const getOverdueAllotments = asyncHandler(async (req, res) => {
  const today = new Date()

  // Find allotments where due date has passed and status is still Active
  const overdueAllotments = await Allotment.find({
    dueDate: { $lt: today },
    status: { $in: ["Active", "Extended"] },
  })
    .populate("laptopId", "id model company")
    .populate("organizationId", "id name contactPerson contactEmail contactPhone")
    .sort({ dueDate: 1 })

  // Update status to Overdue
  await Allotment.updateMany(
    {
      dueDate: { $lt: today },
      status: { $in: ["Active", "Extended"] },
    },
    { status: "Overdue" },
  )

  // Calculate days overdue for each
  const overdueWithDays = overdueAllotments.map((allotment) => ({
    ...allotment.toObject(),
    daysOverdue: Math.ceil((today - allotment.dueDate) / (1000 * 60 * 60 * 24)),
  }))

  res.status(200).json({
    success: true,
    count: overdueWithDays.length,
    data: overdueWithDays,
  })
})

// @desc    Get allotment statistics
// @route   GET /api/allotments/stats
// @access  Public
const getAllotmentStats = asyncHandler(async (req, res) => {
  const totalAllotments = await Allotment.countDocuments()
  const activeAllotments = await Allotment.countDocuments({ status: "Active" })
  const returnedAllotments = await Allotment.countDocuments({ status: "Returned" })
  const overdueAllotments = await Allotment.countDocuments({ status: "Overdue" })

  // Monthly trends
  const monthlyTrends = await Allotment.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$handoverDate" },
          month: { $month: "$handoverDate" },
        },
        allotments: { $sum: 1 },
        revenue: { $sum: "$currentMonthRent" },
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
      total: totalAllotments,
      active: activeAllotments,
      returned: returnedAllotments,
      overdue: overdueAllotments,
      monthlyTrends,
    },
  })
})

module.exports = {
  getAllotments,
  getAllotment,
  createAllotment,
  updateAllotment,
  extendAllotment,
  returnAllotment,
  getOverdueAllotments,
  getAllotmentStats,
}

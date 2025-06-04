const SurrenderRecord = require("../models/SurrenderRecord")
const Allotment = require("../models/Allotment")
const Product = require("../models/Product")
const Organization = require("../models/Organization")
const asyncHandler = require("../middleware/asyncHandler")

// @desc    Get all surrender records
// @route   GET /api/surrenders
// @access  Public
const getSurrenderRecords = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  // Build filter object
  const filter = {}
  if (req.query.organizationId) filter.organizationId = req.query.organizationId
  if (req.query.laptopId) filter.laptopId = req.query.laptopId
  if (req.query.condition) filter.condition = req.query.condition

  const surrenderRecords = await SurrenderRecord.find(filter)
    .populate({
      path: "laptopId",
      model: "Product",
      select: "id model company",
    })
    .populate({
      path: "organizationId",
      model: "Organization",
      select: "id name location",
    })
    .populate({
      path: "allotmentId",
      model: "Allotment",
      select: "id handoverDate",
    })
    .sort({ surrenderDate: -1 })
    .skip(skip)
    .limit(limit)

  const total = await SurrenderRecord.countDocuments(filter)

  res.status(200).json({
    success: true,
    count: surrenderRecords.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: surrenderRecords,
  })
})

// @desc    Get single surrender record
// @route   GET /api/surrenders/:id
// @access  Public
const getSurrenderRecord = asyncHandler(async (req, res) => {
  const surrenderRecord = await SurrenderRecord.findOne({ id: req.params.id })
    .populate("laptopId")
    .populate("organizationId")
    .populate("allotmentId")

  if (!surrenderRecord) {
    return res.status(404).json({
      success: false,
      message: "Surrender record not found",
    })
  }

  res.status(200).json({
    success: true,
    data: surrenderRecord,
  })
})

// @desc    Create surrender record
// @route   POST /api/surrenders
// @access  Public
const createSurrenderRecord = asyncHandler(async (req, res) => {
  const { allotmentId, condition, returnNotes, damageCharges = 0 } = req.body

  // Get the allotment
  const allotment = await Allotment.findOne({ id: allotmentId })
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

  // Generate surrender record ID
  const count = await SurrenderRecord.countDocuments()
  const surrenderId = `SUR${String(count + 1).padStart(4, "0")}`

  // Calculate total rent paid (based on actual days used)
  const surrenderDate = new Date()
  const daysUsed = Math.ceil((surrenderDate - allotment.handoverDate) / (1000 * 60 * 60 * 24))
  const totalRentPaid = (allotment.rentPer30Days / 30) * daysUsed

  const surrenderRecord = await SurrenderRecord.create({
    id: surrenderId,
    laptopId: allotment.laptopId,
    allotmentId: allotment.id,
    organizationId: allotment.organizationId,
    handoverDate: allotment.handoverDate,
    surrenderDate,
    condition,
    returnNotes,
    totalDaysUsed: daysUsed,
    totalRentPaid,
    damageCharges,
    finalAmount: totalRentPaid + damageCharges,
  })

  // Update allotment status
  allotment.surrenderDate = surrenderDate
  allotment.status = "Returned"
  await allotment.save()

  // Update laptop status
  await Product.findOneAndUpdate(
    { id: allotment.laptopId },
    {
      status: condition === "Damaged" ? "Maintenance" : "Available",
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

  const populatedRecord = await SurrenderRecord.findById(surrenderRecord._id)
    .populate("laptopId")
    .populate("organizationId")
    .populate("allotmentId")

  res.status(201).json({
    success: true,
    data: populatedRecord,
  })
})

// @desc    Update surrender record
// @route   PUT /api/surrenders/:id
// @access  Public
const updateSurrenderRecord = asyncHandler(async (req, res) => {
  let surrenderRecord = await SurrenderRecord.findOne({ id: req.params.id })

  if (!surrenderRecord) {
    return res.status(404).json({
      success: false,
      message: "Surrender record not found",
    })
  }

  surrenderRecord = await SurrenderRecord.findOneAndUpdate({ id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("laptopId")
    .populate("organizationId")
    .populate("allotmentId")

  res.status(200).json({
    success: true,
    data: surrenderRecord,
  })
})

// @desc    Delete surrender record
// @route   DELETE /api/surrenders/:id
// @access  Public
const deleteSurrenderRecord = asyncHandler(async (req, res) => {
  const surrenderRecord = await SurrenderRecord.findOne({ id: req.params.id })

  if (!surrenderRecord) {
    return res.status(404).json({
      success: false,
      message: "Surrender record not found",
    })
  }

  await SurrenderRecord.findOneAndDelete({ id: req.params.id })

  res.status(200).json({
    success: true,
    message: "Surrender record deleted successfully",
  })
})

// @desc    Get surrender statistics
// @route   GET /api/surrenders/stats
// @access  Public
const getSurrenderStats = asyncHandler(async (req, res) => {
  const totalReturns = await SurrenderRecord.countDocuments()

  // Group by condition
  const conditionStats = await SurrenderRecord.aggregate([
    {
      $group: {
        _id: "$condition",
        count: { $sum: 1 },
        totalDamageCharges: { $sum: "$damageCharges" },
      },
    },
  ])

  // Monthly return trends
  const monthlyReturns = await SurrenderRecord.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$surrenderDate" },
          month: { $month: "$surrenderDate" },
        },
        returns: { $sum: 1 },
        totalRevenue: { $sum: "$totalRentPaid" },
        totalDamageCharges: { $sum: "$damageCharges" },
      },
    },
    {
      $sort: { "_id.year": -1, "_id.month": -1 },
    },
    {
      $limit: 12,
    },
  ])

  // Average usage days
  const avgUsage = await SurrenderRecord.aggregate([
    {
      $group: {
        _id: null,
        avgDays: { $avg: "$totalDaysUsed" },
        totalRevenue: { $sum: "$totalRentPaid" },
        totalDamageCharges: { $sum: "$damageCharges" },
      },
    },
  ])

  res.status(200).json({
    success: true,
    data: {
      totalReturns,
      conditionStats,
      monthlyReturns,
      averageUsageDays: avgUsage[0]?.avgDays || 0,
      totalRevenue: avgUsage[0]?.totalRevenue || 0,
      totalDamageCharges: avgUsage[0]?.totalDamageCharges || 0,
    },
  })
})

module.exports = {
  getSurrenderRecords,
  getSurrenderRecord,
  createSurrenderRecord,
  updateSurrenderRecord,
  deleteSurrenderRecord,
  getSurrenderStats,
}

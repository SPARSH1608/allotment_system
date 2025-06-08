const Organization = require("../models/Organization")
const Allotment = require("../models/Allotment")
const Product = require("../models/Product")
const asyncHandler = require("../middleware/asyncHandler")

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Public
const getOrganizations = asyncHandler(async (req, res) => {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  // Build filter object
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.location) filter.location = { $regex: req.query.location, $options: "i" }
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { _id: { $regex: req.query.search, $options: "i" } },
      { contactPerson: { $regex: req.query.search, $options: "i" } },
    ]
  }

  const organizations = await Organization.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)

  const total = await Organization.countDocuments(filter)

  // Get additional stats for each organization
  const organizationsWithStats = await Promise.all(
    organizations.map(async (org) => {
      const activeAllotments = await Allotment.countDocuments({
        organizationId: org.id,
        status: "Active",
      })

      const overdueAllotments = await Allotment.countDocuments({
        organizationId: org.id,
        status: "Overdue",
      })

      const totalRevenue = await Allotment.aggregate([
        { $match: { organizationId: org.id } },
        { $group: { _id: null, total: { $sum: "$currentMonthRent" } } },
      ])

      return {
        ...org.toObject(),
        activeAllotments,
        overdueAllotments,
        totalRevenue: totalRevenue[0]?.total || 0,
      }
    }),
  )

  res.status(200).json({
    success: true,
    count: organizations.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: organizationsWithStats,
  })
})

// @desc    Get single organization
// @route   GET /api/organizations/:id
// @access  Public
const getOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.findOne({ _id: req.params.id })

  if (!organization) {
    return res.status(404).json({
      success: false,
      message: "Organization not found",
    })
  }

  // Get organization's allotments with laptop details
  const allotments = await Allotment.find({ organizationId: req.params.id })
    .populate({
      path: "laptopId",
      model: "Product",
      select: "id model company processor ram ssd windowsVersion baseRent",
    })
    .sort({ handoverDate: -1 })

  // Get statistics
  const stats = {
    totalLaptops: allotments.length,
    activeLaptops: allotments.filter((a) => a.status === "Active").length,
    overdueLaptops: allotments.filter((a) => a.status === "Overdue").length,
    totalRevenue: allotments.reduce((sum, a) => sum + a.currentMonthRent, 0),
  }

  res.status(200).json({
    success: true,
    data: {
      organization,
      allotments,
      stats,
    },
  })
})

// @desc    Create new organization
// @route   POST /api/organizations
// @access  Public
const createOrganization = asyncHandler(async (req, res) => {
  // Generate organization ID if not provided
  if (!req.body.id) {
    const count = await Organization.countDocuments()
    req.body.id = `ORG${String(count + 1).padStart(3, "0")}`
  }

  const organization = await Organization.create(req.body)

  res.status(201).json({
    success: true,
    data: organization,
  })
})

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Public
const updateOrganization = asyncHandler(async (req, res) => {
  let organization = await Organization.findOne({ _id: req.params.id })

  if (!organization) {
    return res.status(404).json({
      success: false,
      message: "Organization not found",
    })
  }

  organization = await Organization.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: organization,
  })
})

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Public
const deleteOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.findOne({ _id: req.params.id })

  if (!organization) {
    return res.status(404).json({
      success: false,
      message: "Organization not found",
    })
  }

  // Check if organization has active allotments
  const activeAllotments = await Allotment.countDocuments({
    organizationId: req.params.id,
    status: "Active",
  })

  if (activeAllotments > 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete organization with active allotments",
    })
  }

  await Organization.findOneAndDelete({ id: req.params.id })

  res.status(200).json({
    success: true,
    message: "Organization deleted successfully",
  })
})

// @desc    Get organization statistics
// @route   GET /api/organizations/stats
// @access  Public
const getOrganizationStats = asyncHandler(async (req, res) => {
  const totalOrganizations = await Organization.countDocuments()
  const activeOrganizations = await Organization.countDocuments({ status: "Active" })
  const inactiveOrganizations = await Organization.countDocuments({ status: "Inactive" })

  // Get organizations with most allotments
  const topOrganizations = await Allotment.aggregate([
    {
      $group: {
        _id: "$organizationId",
        totalAllotments: { $sum: 1 },
        activeAllotments: {
          $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
        },
        totalRevenue: { $sum: "$currentMonthRent" },
      },
    },
    {
      $lookup: {
        from: "organizations",
        localField: "_id",
        foreignField: "id",
        as: "organization",
      },
    },
    {
      $unwind: "$organization",
    },
    {
      $sort: { totalAllotments: -1 },
    },
    {
      $limit: 5,
    },
  ])

  res.status(200).json({
    success: true,
    data: {
      total: totalOrganizations,
      active: activeOrganizations,
      inactive: inactiveOrganizations,
      topOrganizations,
    },
  })
})

module.exports = {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats,
}

const Product = require("../models/Product")
const Organization = require("../models/Organization")
const Allotment = require("../models/Allotment")
const SurrenderRecord = require("../models/SurrenderRecord")
const Invoice = require("../models/Invoice")
const asyncHandler = require("../middleware/asyncHandler")

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Public
const getDashboardStats = asyncHandler(async (req, res) => {
  // Product statistics
  const totalProducts = await Product.countDocuments()
  const availableProducts = await Product.countDocuments({ status: "Available" })
  const allottedProducts = await Product.countDocuments({ status: "Allotted" })
  const maintenanceProducts = await Product.countDocuments({ status: "Maintenance" })

  // Organization statistics
  const totalOrganizations = await Organization.countDocuments()
  const activeOrganizations = await Organization.countDocuments({ status: "Active" })

  // Allotment statistics
  const totalAllotments = await Allotment.countDocuments()
  const activeAllotments = await Allotment.countDocuments({ status: "Active" })
  const overdueAllotments = await Allotment.countDocuments({ status: "Overdue" })

  // Invoice statistics
  const totalInvoices = await Invoice.countDocuments()
  const paidInvoices = await Invoice.countDocuments({ status: "Paid" })
  const pendingInvoices = await Invoice.countDocuments({ status: "Sent" })

  // Revenue calculation
  const revenueData = await Invoice.aggregate([
    {
      $match: { status: "Paid" },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ])

  const monthlyRevenue = await Allotment.aggregate([
    {
      $match: { status: { $in: ["Active", "Extended", "Returned"] } },
    },
    {
      $group: {
        _id: null,
        monthlyRevenue: { $sum: "$currentMonthRent" },
      },
    },
  ])

  res.status(200).json({
    success: true,
    data: {
      products: {
        total: totalProducts,
        available: availableProducts,
        allotted: allottedProducts,
        maintenance: maintenanceProducts,
      },
      organizations: {
        total: totalOrganizations,
        active: activeOrganizations,
      },
      allotments: {
        total: totalAllotments,
        active: activeAllotments,
        overdue: overdueAllotments,
      },
      invoices: {
        total: totalInvoices,
        paid: paidInvoices,
        pending: pendingInvoices,
      },
      revenue: {
        total: revenueData[0]?.totalRevenue || 0,
        monthly: monthlyRevenue[0]?.monthlyRevenue || 0,
      },
    },
  })
})

// @desc    Get recent activities
// @route   GET /api/dashboard/activities
// @access  Public
const getRecentActivities = asyncHandler(async (req, res) => {
  const limit = Number.parseInt(req.query.limit) || 10

  // Get recent allotments
  const recentAllotments = await Allotment.find()
    .populate("laptopId", "id model")
    .populate("organizationId", "name")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Get recent returns (manual lookup for laptop info since laptopId is a custom string)
  const recentReturns = await SurrenderRecord.find()
    .populate("organizationId", "name")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // Attach laptop info manually for each return
  for (const record of recentReturns) {
    if (record.laptopId) {
      // Find by custom id field
      const product = await Product.findOne({ id: record.laptopId }, "id model");
      record.laptop = product;
    }
  }

  // Get recent organizations
  const recentOrganizations = await Organization.find()
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  // Get overdue items
  const overdueItems = await Allotment.find({
    status: "Overdue",
    dueDate: { $lt: new Date() },
  })
    .populate("laptopId", "id model")
    .populate("organizationId", "name")
    .sort({ dueDate: 1 })
    .limit(5)
    .lean();

  // Format activities
  const activities = [];

  recentAllotments.forEach((allotment) => {
    activities.push({
      type: "allotment",
      message: `Laptop ${allotment.laptopId?.id || allotment.laptopId} allotted to ${allotment.organizationId?.name || ""}`,
      timestamp: allotment.createdAt,
      status: "success",
    });
  });

  recentReturns.forEach((surrender) => {
    activities.push({
      type: "return",
      message: `Laptop ${surrender.laptop?.id || surrender.laptopId} returned by ${surrender.organizationId?.name || ""}`,
      timestamp: surrender.createdAt,
      status: "info",
    });
  });

  recentOrganizations.forEach((org) => {
    activities.push({
      type: "organization",
      message: `New organization "${org.name}" added`,
      timestamp: org.createdAt,
      status: "success",
    });
  });

  overdueItems.forEach((overdue) => {
    const daysOverdue = Math.ceil((new Date() - overdue.dueDate) / (1000 * 60 * 60 * 24));
    activities.push({
      type: "overdue",
      message: `Overdue alert: ${overdue.laptopId?.id || overdue.laptopId} at ${overdue.organizationId?.name || ""}`,
      timestamp: overdue.dueDate,
      status: "error",
      daysOverdue,
    });
  });

  // Sort by timestamp and limit
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const limitedActivities = activities.slice(0, limit);

  res.status(200).json({
    success: true,
    data: limitedActivities,
  });
})

// @desc    Get allotment trends
// @route   GET /api/dashboard/trends
// @access  Public
const getAllotmentTrends = asyncHandler(async (req, res) => {
  const months = Number.parseInt(req.query.months) || 6

  // Get allotment trends
  const allotmentTrends = await Allotment.aggregate([
    {
      $match: {
        handoverDate: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - months)),
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$handoverDate" },
          month: { $month: "$handoverDate" },
        },
        allotments: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ])

  // Get return trends
  const returnTrends = await SurrenderRecord.aggregate([
    {
      $match: {
        surrenderDate: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - months)),
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$surrenderDate" },
          month: { $month: "$surrenderDate" },
        },
        returns: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ])

  res.status(200).json({
    success: true,
    data: {
      allotmentTrends,
      returnTrends,
    },
  })
})

// @desc    Get organization distribution
// @route   GET /api/dashboard/organization-distribution
// @access  Public
const getOrganizationDistribution = asyncHandler(async (req, res) => {
  const groupedData = await Allotment.aggregate([
    {
      $match: { status: { $in: ["Active", "Extended"] } }
    },
    {
      $group: {
        _id: "$organizationId",
        laptopCount: { $sum: 1 },
        totalRevenue: { $sum: "$currentMonthRent" }
      }
    },
    {
      $lookup: {
        from: "organizations",
        localField: "_id",
        foreignField: "_id",
        as: "organization"
      }
    },
    { $unwind: "$organization" },
    {
      $project: {
        _id: 0,
        organizationName: "$organization.name",
        laptopCount: 1,
        totalRevenue: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: groupedData
  });
})


module.exports = {
  getDashboardStats,
  getRecentActivities,
  getAllotmentTrends,
  getOrganizationDistribution,
}

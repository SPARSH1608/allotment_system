const Product = require("../models/Product")
const Allotment = require("../models/Allotment")
const asyncHandler = require("../middleware/asyncHandler")

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
 
  // Build filter object
  const filter = {}
  if (req.query.status) filter.status = req.query.status
  if (req.query.company) filter.company = req.query.company
  if (req.query.processor) filter.processor = req.query.processor
  if (req.query.search) {
    filter.$or = [
      { id: { $regex: req.query.search, $options: "i" } },
      { model: { $regex: req.query.search, $options: "i" } },
      { serialNumber: { $regex: req.query.search, $options: "i" } },
    ]
  }

  const products = await Product.find(filter)
    .populate("currentAllotmentId", "organizationId location")

    

  const total = await Product.countDocuments(filter)

  res.status(200).json({
    success: true,
    count: products.length,
    total,
  
    data: products,
  })
})

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  console.log("Fetching product with ID:", req.params.id)
  const product = await Product.findOne({ _id: req.params.id }).populate("currentAllotmentId")

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    })
  }

  // Get allotment history
  const allotmentHistory = await Allotment.find({ laptopId: req.params.id })
    .populate("organizationId", "name location")
    .sort({ handoverDate: -1 })

  res.status(200).json({
    success: true,
    data: {
      product,
      allotmentHistory,
    },
  })
})

// @desc    Create new product
// @route   POST /api/products
// @access  Public
const createProduct = asyncHandler(async (req, res) => {
  if (!req.body.serialNumber || req.body.serialNumber.trim() === "") {
    req.body.serialNumber = "0000"
  }
  const product = await Product.create(req.body)

  res.status(201).json({
    success: true,
    data: product,
  })
})

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Public
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findOne({ _id: req.params.id })

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    })
  }

  product = await Product.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    success: true,
    data: product,
  })
})

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Public
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id })

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    })
  }

  // Check if product is currently allotted
  if (product.status === "Allotted") {
    return res.status(400).json({
      success: false,
      message: "Cannot delete product that is currently allotted",
    })
  }

  await Product.findOneAndDelete({ _id: req.params.id })

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  })
})

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Public
const getProductStats = asyncHandler(async (req, res) => {
  const stats = await Product.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ])

  const totalProducts = await Product.countDocuments()
  const availableProducts = await Product.countDocuments({ status: "Available" })
  const allottedProducts = await Product.countDocuments({ status: "Allotted" })
  const maintenanceProducts = await Product.countDocuments({ status: "Maintenance" })

  res.status(200).json({
    success: true,
    data: {
      total: totalProducts,
      available: availableProducts,
      allotted: allottedProducts,
      maintenance: maintenanceProducts,
      breakdown: stats,
    },
  })
})

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
}

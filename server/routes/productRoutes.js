const express = require("express")
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
} = require("../controllers/productController")

const router = express.Router()

router.route("/").get(getProducts).post(createProduct)

router.route("/stats").get(getProductStats)

router.route("/:id").get(getProduct).put(updateProduct).delete(deleteProduct)

module.exports = router

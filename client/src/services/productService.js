import { apiService } from "./api"

class ProductService {
  // Get all products
  async getProducts(params = {}) {
    return apiService.get("/products", params)
  }

  // Get product by ID
  async getProductById(id) {
    return apiService.get(`/products/${id}`)
  }

  // Create new product
  async createProduct(productData) {
    return apiService.post("/products", productData)
  }

  // Update product
  async updateProduct(id, productData) {
    return apiService.put(`/products/${id}`, productData)
  }

  // Delete product
  async deleteProduct(id) {
    return apiService.delete(`/products/${id}`)
  }

  // Get product statistics
  async getProductStats() {
    return apiService.get("/products/stats")
  }

  // Bulk upload products
  async bulkUpload(formData) {
    return apiService.upload("/products/bulk-upload", formData)
  }

  // Search products
  async searchProducts(query) {
    return apiService.get("/products/search", { q: query })
  }

  // Get products by status
  async getProductsByStatus(status) {
    return apiService.get("/products", { status })
  }

  // Get available products
  async getAvailableProducts() {
    return apiService.get("/products", { status: "available" })
  }

  // Update product status
  async updateProductStatus(id, status) {
    return apiService.patch(`/products/${id}/status`, { status })
  }
}

export const productService = new ProductService()

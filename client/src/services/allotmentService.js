import { apiService } from "./api"

class AllotmentService {
  // Get all allotments
  async getAllotments(params = {}) {
    return apiService.get("/allotments", params)
  }

  // Get allotment by ID
  async getAllotmentById(id) {
    return apiService.get(`/allotments/${id}`)
  }

  // Create new allotment
  async createAllotment(allotmentData) {
    return apiService.post("/allotments", allotmentData)
  }

  // Update allotment
  async updateAllotment(id, allotmentData) {
    return apiService.put(`/allotments/${id}`, allotmentData)
  }

  // Delete allotment
  async deleteAllotment(id) {
    return apiService.delete(`/allotments/${id}`)
  }

  // Extend allotment
  async extendAllotment(id, extensionData) {
    return apiService.post(`/allotments/${id}/extend`, extensionData)
  }

  // Return allotment
  async returnAllotment(id, returnData) {
    return apiService.post(`/allotments/${id}/return`, returnData)
  }

  // Get overdue allotments
  async getOverdueAllotments() {
    return apiService.get("/allotments/overdue")
  }

  // Get allotments by status
  async getAllotmentsByStatus(status) {
    return apiService.get("/allotments", { status })
  }

  // Get allotments by organization
  async getAllotmentsByOrganization(organizationId) {
    return apiService.get("/allotments", { organizationId })
  }

  // Get allotments by product
  async getAllotmentsByProduct(productId) {
    return apiService.get("/allotments", { productId })
  }

  // Get allotment statistics
  async getAllotmentStats() {
    return apiService.get("/allotments/stats")
  }

  // Bulk return allotments
  async bulkReturnAllotments(allotmentIds, returnData) {
    return apiService.post("/allotments/bulk-return", {
      allotmentIds,
      ...returnData,
    })
  }

  // Get allotment history
  async getAllotmentHistory(id) {
    return apiService.get(`/allotments/${id}/history`)
  }
}

export const allotmentService = new AllotmentService()

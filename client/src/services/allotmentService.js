import { apiService } from "./api"

class AllotmentService {
  // Get all allotments with filters and pagination
  async getAllotments(params = {}) {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 40,
      status: params.status || "",
      organizationId: params.organizationId || "",
      productId: params.productId || "",
      search: params.search || "",
      startDate: params.startDate || "",
      endDate: params.endDate || "",
      sortBy: params.sortBy || "allotmentDate",
      sortOrder: params.sortOrder || "desc",
    }

    return apiService.get("/allotments", queryParams)
  }

  // Get allotment by ID with full details
  async getAllotmentById(id) {
    return apiService.get(`/allotments/${id}`)
  }

  // Create new allotment
  async createAllotment(allotmentData) {
    console.log("Creating allotment with data:", allotmentData)
    // Only send the fields expected by the backend controller
    const payload = {
      laptopId: allotmentData.laptopId,
      organizationId: allotmentData.organizationId,
      handoverDate: allotmentData.handoverDate,
      dueDate: allotmentData.dueDate,
      rentPer30Days: allotmentData.rentPer30Days,
      location: allotmentData.location,
    }

    return apiService.post("/allotments", payload)
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
    const payload = {
      extensionDays: extensionData.extensionDays,
      newRent: extensionData.newRent,
      notes: extensionData.notes || "",
    }

    return apiService.post(`/allotments/${id}/extend`, payload)
  }

  // Return allotment
  async returnAllotment(id, returnData) {
    const payload = {
      actualReturnDate: returnData.actualReturnDate,
      condition: returnData.condition,
      damageCharges: returnData.damageCharges || 0,
      returnNotes: returnData.returnNotes || "",
      inspectedBy: returnData.inspectedBy || "",
      refundAmount: returnData.refundAmount || 0,
    }

    return apiService.post(`/allotments/${id}/return`, payload)
  }

  // Get overdue allotments
  async getOverdueAllotments(params = {}) {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      overdueDays: params.overdueDays || 0, // minimum overdue days
    }

    return apiService.get("/allotments/overdue", queryParams)
  }

  // Get allotment statistics
  async getAllotmentStats(params = {}) {
    const queryParams = {
      period: params.period || "month", // day, week, month, year
      startDate: params.startDate || "",
      endDate: params.endDate || "",
    }

    return apiService.get("/allotments/stats", queryParams)
  }

  // Get allotments by status
  async getAllotmentsByStatus(status, params = {}) {
    return apiService.get("/allotments", { ...params, status })
  }

  // Get allotments by organization
  async getAllotmentsByOrganization(organizationId, params = {}) {
    return apiService.get("/allotments", { ...params, organizationId })
  }

  // Get allotments by product
  async getAllotmentsByProduct(productId, params = {}) {
    return apiService.get("/allotments", { ...params, productId })
  }

  // Bulk return allotments
  async bulkReturnAllotments(allotmentIds, returnData) {
    const payload = {
      allotmentIds,
      actualReturnDate: returnData.actualReturnDate,
      condition: returnData.condition,
      returnNotes: returnData.returnNotes || "",
      inspectedBy: returnData.inspectedBy || "",
    }

    return apiService.post("/allotments/bulk-return", payload)
  }

  // Get allotment history/timeline
  async getAllotmentHistory(id) {
    return apiService.get(`/allotments/${id}/history`)
  }

  // Get revenue statistics
  async getRevenueStats(params = {}) {
    const queryParams = {
      period: params.period || "month",
      startDate: params.startDate || "",
      endDate: params.endDate || "",
    }

    return apiService.get("/allotments/revenue", queryParams)
  }

  // Get upcoming returns
  async getUpcomingReturns(days = 7) {
    return apiService.get("/allotments/upcoming-returns", { days })
  }

  // Search allotments
  async searchAllotments(query, params = {}) {
    return apiService.get("/allotments/search", { q: query, ...params })
  }

  // Export allotments data
  async exportAllotments(format = "csv", filters = {}) {
    return apiService.get("/allotments/export", { format, ...filters })
  }

  // Get allotment summary
  async getAllotmentSummary() {
    return apiService.get("/allotments/summary")
  }

  // Renew allotment
  async renewAllotment(id, renewalData) {
    const payload = {
      newDuration: renewalData.newDuration, // in months
      newMonthlyRent: renewalData.newMonthlyRent,
      renewalDate: renewalData.renewalDate,
      notes: renewalData.notes || "",
    }

    return apiService.post(`/allotments/${id}/renew`, payload)
  }

  // Cancel allotment
  async cancelAllotment(id, cancellationData) {
    const payload = {
      cancellationDate: cancellationData.cancellationDate,
      cancellationReason: cancellationData.cancellationReason,
      penaltyAmount: cancellationData.penaltyAmount || 0,
      refundAmount: cancellationData.refundAmount || 0,
      notes: cancellationData.notes || "",
    }

    return apiService.post(`/allotments/${id}/cancel`, payload)
  }
}

export const allotmentService = new AllotmentService()

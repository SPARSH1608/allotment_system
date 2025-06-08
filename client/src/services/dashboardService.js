import { apiService } from "./api"

class DashboardService {
  // Get dashboard statistics
  async getDashboardStats() {
    return apiService.get("/dashboard/stats")
  }

  // Get recent activities
  async getRecentActivities(limit = 10) {
    return apiService.get("/dashboard/activities", { limit })
  }

  // Get allotment trends
  async getAllotmentTrends(months = 6) {
    return apiService.get("/dashboard/trends", { months })
  }

  // Get organization distribution
  async getOrganizationDistribution() {
    return apiService.get("/dashboard/organization-distribution")
  }

  // Get revenue analytics
  async getRevenueAnalytics(period = "monthly") {
    return apiService.get("/dashboard/revenue", { period })
  }

  // Get product utilization
  async getProductUtilization() {
    return apiService.get("/dashboard/product-utilization")
  }

  // Get performance metrics
  async getPerformanceMetrics() {
    return apiService.get("/dashboard/performance")
  }

  // Get alerts and notifications
  async getAlerts() {
    return apiService.get("/dashboard/alerts")
  }

  // Get system health
  async getSystemHealth() {
    return apiService.get("/dashboard/health")
  }
}

export const dashboardService = new DashboardService()

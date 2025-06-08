import { apiService } from "./api"

class OrganizationService {
  // Get all organizations
  async getOrganizations(params = {}) {
    return apiService.get("/organizations", params)
  }

  // Get organization by ID
  async getOrganizationById(id) {
    return apiService.get(`/organizations/${id}`)
  }

  // Create new organization
  async createOrganization(organizationData) {
    return apiService.post("/organizations", organizationData)
  }

  // Update organization
  async updateOrganization(id, organizationData) {
    return apiService.put(`/organizations/${id}`, organizationData)
  }

  // Delete organization
  async deleteOrganization(id) {
    return apiService.delete(`/organizations/${id}`)
  }

  // Get organization statistics
  async getOrganizationStats(id) {
    return apiService.get(`/organizations/${id}/stats`)
  }

  // Get organization allotments
  async getOrganizationAllotments(id, params = {}) {
    return apiService.get(`/organizations/${id}/allotments`, params)
  }

  // Get organization invoices
  async getOrganizationInvoices(id, params = {}) {
    return apiService.get(`/organizations/${id}/invoices`, params)
  }

  // Search organizations
  async searchOrganizations(query) {
    return apiService.get("/organizations/search", { q: query })
  }

  // Get organizations by location
  async getOrganizationsByLocation(location) {
    return apiService.get("/organizations", { location })
  }

  // Update organization status
  async updateOrganizationStatus(id, status) {
    return apiService.patch(`/organizations/${id}/status`, { status })
  }
}

export const organizationService = new OrganizationService()

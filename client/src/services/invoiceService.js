import { apiService } from "./api"

class InvoiceService {
  // Get all invoices
  async getInvoices(params = {}) {
    return apiService.get("/invoices", params)
  }

  // Get invoice by number
  async getInvoiceByNumber(invoiceNumber) {
    return apiService.get(`/invoices/${invoiceNumber}`)
  }

  // Create new invoice
  async createInvoice(invoiceData) {
    return apiService.post("/invoices", invoiceData)
  }

  // Update invoice
  async updateInvoice(invoiceNumber, invoiceData) {
    return apiService.put(`/invoices/${invoiceNumber}`, invoiceData)
  }

  // Delete invoice
  async deleteInvoice(invoiceNumber) {
    return apiService.delete(`/invoices/${invoiceNumber}`)
  }

  // Mark invoice as paid
  async markInvoicePaid(invoiceNumber, paymentData) {
    return apiService.post(`/invoices/${invoiceNumber}/pay`, paymentData)
  }

  // Get invoice statistics
  async getInvoiceStats() {
    return apiService.get("/invoices/stats")
  }

  // Generate invoice PDF
  async generateInvoicePDF(invoiceNumber) {
    return apiService.get(`/invoices/${invoiceNumber}/pdf`)
  }

  // Send invoice email
  async sendInvoiceEmail(invoiceNumber, emailData) {
    return apiService.post(`/invoices/${invoiceNumber}/send`, emailData)
  }

  // Get invoices by organization
  async getInvoicesByOrganization(organizationId) {
    return apiService.get("/invoices", { organizationId })
  }

  // Get invoices by status
  async getInvoicesByStatus(status) {
    return apiService.get("/invoices", { status })
  }

  // Get overdue invoices
  async getOverdueInvoices() {
    return apiService.get("/invoices/overdue")
  }

  // Bulk create invoices
  async bulkCreateInvoices(invoicesData) {
    return apiService.post("/invoices/bulk-create", invoicesData)
  }
}

export const invoiceService = new InvoiceService()

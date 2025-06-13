import { apiService } from "./api"

class BulkAllotmentService {
  // Upload and process bulk allotment file
  async uploadBulkAllotments(file, options = {}) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("options", JSON.stringify(options))

    return apiService.post("/allotments/bulk-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  }

  // Preview bulk allotment data before processing
  async previewBulkAllotments(file) {
    const formData = new FormData()
    formData.append("file", file)

    return apiService.post("/allotments/bulk-preview", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  }

  // Get field mapping suggestions
  async getFieldMappings(headers) {
    return apiService.post("/allotments/field-mappings", { headers })
  }

  // Validate bulk allotment data
  async validateBulkData(data) {
    return apiService.post("/allotments/bulk-validate", { data })
  }

  // Get bulk upload template
  async downloadTemplate(format = "xlsx") {
    return apiService.get(
      "/allotments/bulk-template",
      { format },
      {
        responseType: "blob",
      },
    )
  }

  // Get bulk upload history
  async getBulkUploadHistory(params = {}) {
    return apiService.get("/allotments/bulk-history", params)
  }

  // Get bulk upload status
  async getBulkUploadStatus(uploadId) {
    return apiService.get(`/allotments/bulk-status/${uploadId}`)
  }

  // Cancel bulk upload
  async cancelBulkUpload(uploadId) {
    return apiService.post(`/allotments/bulk-cancel/${uploadId}`)
  }
}

export const bulkAllotmentService = new BulkAllotmentService()

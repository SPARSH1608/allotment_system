import { apiService } from "./api"

class UploadService {
  // Upload single file
  async uploadFile(file, type = "general") {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    return apiService.upload("/upload/single", formData)
  }

  // Upload multiple files
  async uploadMultipleFiles(files, type = "general") {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files`, file)
    })
    formData.append("type", type)

    return apiService.upload("/upload/multiple", formData)
  }

  // Upload CSV for bulk import
  async uploadCSV(file, entity) {
    const formData = new FormData()
    formData.append("csv", file)
    formData.append("entity", entity)

    return apiService.upload("/upload/csv", formData)
  }

  // Upload product images
  async uploadProductImages(productId, images) {
    const formData = new FormData()
    images.forEach((image, index) => {
      formData.append(`images`, image)
    })

    return apiService.upload(`/upload/products/${productId}/images`, formData)
  }

  // Upload organization documents
  async uploadOrganizationDocuments(organizationId, documents) {
    const formData = new FormData()
    documents.forEach((doc, index) => {
      formData.append(`documents`, doc)
    })

    return apiService.upload(`/upload/organizations/${organizationId}/documents`, formData)
  }

  // Delete uploaded file
  async deleteFile(fileId) {
    return apiService.delete(`/upload/files/${fileId}`)
  }

  // Get file info
  async getFileInfo(fileId) {
    return apiService.get(`/upload/files/${fileId}`)
  }
}

export const uploadService = new UploadService()

import axios from "axios"

// Base API configuration
// For Vite projects, use import.meta.env; for CRA, use process.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL  || "http://localhost:4000/api"
console.log("API Base URL:", API_BASE_URL)
class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    })
  }

  // Get auth token
  getToken() {
    return localStorage.getItem("token")
  }

  // Get default headers
  getHeaders(includeAuth = true) {
    const headers = {}

    if (includeAuth) {
      const token = this.getToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    return headers
  }

  // Generic request method
  async request(endpoint, options = {}) {
    try {
      const response = await this.client.request({
        url: endpoint,
        headers: this.getHeaders(options.auth !== false),
        ...options,
      })
      return response.data
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error.response?.data || error.message
    }
  }

  // HTTP methods
  async get(endpoint, params = {}) {
    return this.request(endpoint, { method: "GET", params })
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, { method: "POST", data })
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, { method: "PUT", data })
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" })
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, { method: "PATCH", data })
  }

  // File upload method
  async upload(endpoint, formData) {
    const token = this.getToken()
    const headers = {}

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return this.request(endpoint, {
      method: "POST",
      headers,
      data: formData,
      auth: false, // Don't add Content-Type for FormData
    })
  }
}

export const apiService = new ApiService()

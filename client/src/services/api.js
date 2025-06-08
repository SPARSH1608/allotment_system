// Base API configuration
// For Vite projects, use import.meta.env; for CRA, use process.env
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
console.log("API Base URL:", API_BASE_URL)
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // Get auth token
  getToken() {
    return localStorage.getItem("token")
  }

  // Get default headers
  getHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
    }

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
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: this.getHeaders(options.auth !== false),
      credentials: "include",
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }

  // HTTP methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url, { method: "GET" })
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" })
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
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
      body: formData,
      auth: false, // Don't add Content-Type for FormData
    })
  }
}

export const apiService = new ApiService()

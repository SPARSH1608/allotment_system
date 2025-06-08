import { apiService } from "./api"

class AuthService {
  // Login user
  async login(credentials) {
    const response = await apiService.post("/auth/login", credentials)
    if (response.token) {
      localStorage.setItem("token", response.token)
    }
    return response
  }

  // Register user
  async register(userData) {
    const response = await apiService.post("/auth/register", userData)
    if (response.token) {
      localStorage.setItem("token", response.token)
    }
    return response
  }

  // Logout user
  async logout() {
    try {
      await apiService.get("/auth/logout")
    } finally {
      localStorage.removeItem("token")
    }
  }

  // Get current user
  async getCurrentUser() {
    return apiService.get("/auth/me")
  }

  // Update user details
  async updateDetails(userData) {
    return apiService.put("/auth/updatedetails", userData)
  }

  // Update password
  async updatePassword(passwordData) {
    return apiService.put("/auth/updatepassword", passwordData)
  }

  // Forgot password
  async forgotPassword(email) {
    return apiService.post("/auth/forgotpassword", { email })
  }

  // Reset password
  async resetPassword(resetToken, password) {
    return apiService.put(`/auth/resetpassword/${resetToken}`, { password })
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem("token")
  }

  // Get stored token
  getToken() {
    return localStorage.getItem("token")
  }
}

export const authService = new AuthService()

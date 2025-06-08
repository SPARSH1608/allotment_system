import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { authService } from "../../services/authService"

// Async thunks using services
export const loginUser = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const registerUser = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    console.log("Registering user with data:", userData)
    const response = await authService.register(userData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await authService.logout()
    return null
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const getCurrentUser = createAsyncThunk("auth/getCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.getCurrentUser()
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateUserDetails = createAsyncThunk("auth/updateDetails", async (userData, { rejectWithValue }) => {
  try {
    const response = await authService.updateDetails(userData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updatePassword = createAsyncThunk("auth/updatePassword", async (passwordData, { rejectWithValue }) => {
  try {
    const response = await authService.updatePassword(passwordData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const forgotPassword = createAsyncThunk("auth/forgotPassword", async (email, { rejectWithValue }) => {
  try {
    const response = await authService.forgotPassword(email)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ resetToken, password }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(resetToken, password)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const initialState = {
  user: null,
  token: authService.getToken(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,
  passwordResetSent: false,
  passwordResetSuccess: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearPasswordReset: (state) => {
      state.passwordResetSent = false
      state.passwordResetSuccess = false
    },
    resetAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
      state.passwordResetSent = false
      state.passwordResetSuccess = false
    },
    setAuthFromStorage: (state) => {
      const token = authService.getToken()
      state.token = token
      state.isAuthenticated = !!token
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.token = authService.getToken()
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.token = authService.getToken()
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.loading = false
        state.error = null
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
      // Update user details
      .addCase(updateUserDetails.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(updateUserDetails.rejected, (state, action) => {
        state.error = action.payload
      })
      // Update password
      .addCase(updatePassword.fulfilled, (state) => {
        state.error = null
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.error = action.payload
      })
      // Forgot password
      .addCase(forgotPassword.fulfilled, (state) => {
        state.passwordResetSent = true
        state.error = null
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.error = action.payload
      })
      // Reset password
      .addCase(resetPassword.fulfilled, (state) => {
        state.passwordResetSuccess = true
        state.error = null
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { clearError, clearPasswordReset, resetAuth, setAuthFromStorage } = authSlice.actions
export default authSlice.reducer

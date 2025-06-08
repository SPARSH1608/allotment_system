import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { productService } from "../../services/productService"

// Async thunks using services
export const fetchProducts = createAsyncThunk("products/fetchProducts", async (params = {}, { rejectWithValue }) => {
  try {
    const response = await productService.getProducts(params)
    return response
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchProductById = createAsyncThunk("products/fetchProductById", async (id, { rejectWithValue }) => {
  try {
    const response = await productService.getProductById(id)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const createProduct = createAsyncThunk("products/createProduct", async (productData, { rejectWithValue }) => {
  try {
    const response = await productService.createProduct(productData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await productService.updateProduct(id, productData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const deleteProduct = createAsyncThunk("products/deleteProduct", async (id, { rejectWithValue }) => {
  try {
    await productService.deleteProduct(id)
    return id
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const fetchProductStats = createAsyncThunk("products/fetchStats", async (_, { rejectWithValue }) => {
  try {
    const response = await productService.getProductStats()
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const bulkUploadProducts = createAsyncThunk("products/bulkUpload", async (formData, { rejectWithValue }) => {
  try {
    const response = await productService.bulkUpload(formData)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const searchProducts = createAsyncThunk("products/searchProducts", async (query, { rejectWithValue }) => {
  try {
    const response = await productService.searchProducts(query)
    return response.data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateProductStatus = createAsyncThunk(
  "products/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await productService.updateProductStatus(id, status)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const initialState = {
  products: [],
  currentProduct: null,
  stats: null,
  searchResults: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    count: 0,
  },
  filters: {
    search: "",
    status: "",
    company: "",
    processor: "",
    minPrice: "",
    maxPrice: "",
  },
  sortBy: "createdAt",
  sortOrder: "desc",
}

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        search: "",
        status: "",
        company: "",
        processor: "",
        minPrice: "",
        maxPrice: "",
      }
    },
    setSorting: (state, action) => {
      state.sortBy = action.payload.sortBy
      state.sortOrder = action.payload.sortOrder
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null
    },
    clearSearchResults: (state) => {
      state.searchResults = []
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.data
        state.pagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total,
          count: action.payload.count,
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false
        state.currentProduct = action.payload
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false
        state.products.unshift(action.payload)
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p.id === action.payload.id)
        if (index !== -1) {
          state.products[index] = action.payload
        }
        if (state.currentProduct && state.currentProduct.id === action.payload.id) {
          state.currentProduct = action.payload
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.payload
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload)
        if (state.currentProduct && state.currentProduct.id === action.payload) {
          state.currentProduct = null
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload
      })
      // Fetch stats
      .addCase(fetchProductStats.fulfilled, (state, action) => {
        state.stats = action.payload
      })
      // Bulk upload
      .addCase(bulkUploadProducts.fulfilled, (state, action) => {
        state.products = [...action.payload, ...state.products]
      })
      .addCase(bulkUploadProducts.rejected, (state, action) => {
        state.error = action.payload
      })
      // Search products
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchResults = action.payload
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.error = action.payload
      })
      // Update product status
      .addCase(updateProductStatus.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p.id === action.payload.id)
        if (index !== -1) {
          state.products[index] = action.payload
        }
      })
  },
})

export const { clearError, setFilters, clearFilters, setSorting, clearCurrentProduct, clearSearchResults, setLoading } =
  productSlice.actions

export default productSlice.reducer

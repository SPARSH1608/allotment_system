import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  sidebarOpen: true,
  theme: "light",
  notifications: [],
  modals: {
    addProduct: false,
    editProduct: false,
    addOrganization: false,
    bulkUpload: false,
    extendRental: false,
    markReturned: false,
    createInvoice: false,
  },
  loading: {
    global: false,
    products: false,
    organizations: false,
    allotments: false,
    invoices: false,
  },
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    setTheme: (state, action) => {
      state.theme = action.payload
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: "info",
        title: "",
        message: "",
        duration: 5000,
        ...action.payload,
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = false
      })
    },
    setLoading: (state, action) => {
      const { key, value } = action.payload
      state.loading[key] = value
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  setLoading,
  setGlobalLoading,
} = uiSlice.actions

export default uiSlice.reducer

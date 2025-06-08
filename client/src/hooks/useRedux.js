import { useDispatch, useSelector } from "react-redux"

// Typed hooks for better development experience
export const useAppDispatch = () => useDispatch()
export const useAppSelector = useSelector

// Custom hooks for common selectors
export const useAuth = () => {
  return useAppSelector((state) => state.auth)
}

export const useProducts = () => {
  return useAppSelector((state) => state.products)
}

export const useOrganizations = () => {
  return useAppSelector((state) => state.organizations)
}

export const useAllotments = () => {
  return useAppSelector((state) => state.allotments)
}

export const useInvoices = () => {
  return useAppSelector((state) => state.invoices)
}

export const useDashboard = () => {
  return useAppSelector((state) => state.dashboard)
}

export const useUI = () => {
  return useAppSelector((state) => state.ui)
}

// Specific selector hooks
export const useAuthUser = () => {
  
  return useAppSelector((state) => {
    
    console.log("useAuthUser called", state.auth)
    return state.auth.user})
}

export const useIsAuthenticated = () => {
  return useAppSelector((state) => state.auth.isAuthenticated)
}

export const useAuthLoading = () => {
  return useAppSelector((state) => state.auth.loading)
}

export const useProductsData = () => {
  return useAppSelector((state) => ({
    products: state.products.products,
    loading: state.products.loading,
    error: state.products.error,
    pagination: state.products.pagination,
  }))
}

export const useOrganizationsData = () => {
  return useAppSelector((state) => ({
    organizations: state.organizations.organizations,
    loading: state.organizations.loading,
    error: state.organizations.error,
    pagination: state.organizations.pagination,
  }))
}

export const useAllotmentsData = () => {
  return useAppSelector((state) => ({
    allotments: state.allotments.allotments,
    loading: state.allotments.loading,
    error: state.allotments.error,
    pagination: state.allotments.pagination,
  }))
}

export const useInvoicesData = () => {
  return useAppSelector((state) => ({
    invoices: state.invoices.invoices,
    loading: state.invoices.loading,
    error: state.invoices.error,
    pagination: state.invoices.pagination,
  }))
}

export const useDashboardData = () => {
  return useAppSelector((state) => ({
    stats: state.dashboard.stats,
    activities: state.dashboard.activities,
    trends: state.dashboard.trends,
    loading: state.dashboard.loading,
    error: state.dashboard.error,
  }))
}

export const useNotifications = () => {
  return useAppSelector((state) => state.ui.notifications)
}

export const useModals = () => {
  return useAppSelector((state) => state.ui.modals)
}

export const useSidebar = () => {
  return useAppSelector((state) => ({
    isOpen: state.ui.sidebarOpen,
    theme: state.ui.theme,
  }))
}

import { Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Building2, Laptop, FileText, Settings, User, LogIn, UserPlus, Plus, LogOut } from "lucide-react"
import { useIsAuthenticated, useAuthUser, useAppDispatch } from "../hooks/useRedux"
import { logoutUser } from "../store/slices/authSlice"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, auth: true },
  { name: "Organizations", href: "/organizations", icon: Building2, auth: true },
  { name: "Products", href: "/products", icon: Laptop, auth: true },
  { name: "Allotments", href: "/allotments", icon: FileText, auth: true },
  { name: "Invoices", href: "/invoices", icon: FileText, auth: true },
  { name: "Settings", href: "/settings", icon: Settings, auth: true },
  { name: "User Profile", href: "/profile", icon: User, auth: true },
  { name: "Login", href: "/login", icon: LogIn, auth: false },
  { name: "Register", href: "/register", icon: UserPlus, auth: false },
]

export function Sidebar() {
  const location = useLocation()
  const isAuthenticated = useIsAuthenticated()
  const user = useAuthUser()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate("/login")
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">LaptopRent</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation
            .filter(item => item.auth === isAuthenticated)
            .map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 mt-2 text-sm font-medium text-red-600 rounded-md hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="ml-3">
              {isAuthenticated && user ? (
                <p className="text-sm font-medium text-gray-900">{user.email || user.name}</p>
              ) : (
                <p className="text-sm text-gray-500">Not logged in</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Sidebar
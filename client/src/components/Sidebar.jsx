import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Building2, Laptop, FileText, Settings, User, LogIn, UserPlus, Plus } from "lucide-react"

const navigation = [
  { name: "Login", href: "/login", icon: LogIn },
  { name: "Register", href: "/register", icon: UserPlus },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Organizations", href: "/organizations", icon: Building2 },
  { name: "Organization Detail", href: "/organizations/detail", icon: Building2 },
  { name: "Add Organization", href: "/organizations/add", icon: Plus },
  { name: "Products", href: "/products", icon: Laptop },
  { name: "Product Detail", href: "/products/detail", icon: Laptop },
  { name: "Allotments", href: "/allotments", icon: FileText },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "User Profile", href: "/profile", icon: User },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">LaptopRent</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
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
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">admin@laptoprent...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Sidebar
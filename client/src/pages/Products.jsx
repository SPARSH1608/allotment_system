

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Upload, Plus, Edit, Trash2, Laptop } from "lucide-react"
import  AddProductModal  from "../components/add-product-modal"
import { Link } from "react-router-dom"

const products = [
  {
    id: "LP001",
    model: "ThinkPad E14",
    brand: "Lenovo",
    processor: "i5 8th Gen",
    ram: "8GB RAM",
    storage: "256GB SSD",
    os: "Win10",
    serialNumber: "LN123456789",
    status: "Rented",
    organization: "TechCorp Solutions",
    baseRent: 3000,
  },
  {
    id: "LP002",
    model: "Inspiron 15",
    brand: "Dell",
    processor: "i7 10th Gen",
    ram: "16GB RAM",
    storage: "512GB SSD",
    os: "Win11",
    serialNumber: "DL987654321",
    status: "Overdue",
    organization: "DataSoft Inc",
    baseRent: 4500,
  },
  {
    id: "LP003",
    model: "MacBook Air",
    brand: "Apple",
    processor: "M1 Chip",
    ram: "8GB RAM",
    storage: "256GB SSD",
    os: "macOS",
    serialNumber: "AP456789123",
    status: "Available",
    organization: "",
    baseRent: 6000,
  },
  {
    id: "LP004",
    model: "Pavilion 14",
    brand: "HP",
    processor: "i5 11th Gen",
    ram: "8GB RAM",
    storage: "512GB SSD",
    os: "Win11",
    serialNumber: "HP789123456",
    status: "Rented",
    organization: "InnovateTech",
    baseRent: 3500,
  },
  {
    id: "LP005",
    model: "VivoBook 15",
    brand: "Asus",
    processor: "Ryzen 5",
    ram: "16GB RAM",
    storage: "256GB SSD",
    os: "Win10",
    serialNumber: "AS321654987",
    status: "Available",
    organization: "",
    baseRent: 2800,
  },
]

 const ProductsPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusBadge = (status) => {
    switch (status) {
      case "Rented":
        return <Badge variant="success">{status}</Badge>
      case "Available":
        return <Badge variant="warning">{status}</Badge>
      case "Overdue":
        return <Badge variant="error">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload XLSX
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </div>
        <p className="text-gray-600">Manage your laptop inventory and track allotment history.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Laptop className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">247</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Currently Rented</p>
              <p className="text-2xl font-bold text-gray-900">189</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">58</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search products by Asset ID, Model, or Serial Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-3">
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm w-40">
              <option>All Brands</option>
              <option>Lenovo</option>
              <option>Dell</option>
              <option>Apple</option>
              <option>HP</option>
              <option>Asus</option>
            </select>

            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm w-40">
              <option>All Status</option>
              <option>Available</option>
              <option>Rented</option>
              <option>Overdue</option>
            </select>

            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm w-40">
              <option>All Processors</option>
              <option>Intel i5</option>
              <option>Intel i7</option>
              <option>AMD Ryzen</option>
              <option>Apple M1</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specifications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Rent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/products/${product.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                      {product.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.brand}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="space-y-1">
                      <div>
                        {product.processor} • {product.ram}
                      </div>
                      <div>
                        {product.storage} • {product.os}
                      </div>
                      <div className="text-xs text-gray-500">SN: {product.serialNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getStatusBadge(product.status)}
                      {product.organization && <div className="text-xs text-gray-500">{product.organization}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{product.baseRent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">Showing 1 to 5 of 247 products</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-600 text-white">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>

      <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  )
}
export default ProductsPage 
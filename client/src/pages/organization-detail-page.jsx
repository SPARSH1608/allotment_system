"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { ArrowLeft, Edit, Upload, Plus } from "lucide-react"

const organizationData = {
  name: "TechCorp Solutions",
  location: "Noida, UP",
  totalLaptops: 45,
  activeLaptops: 42,
  overdue: 3,
  contactPerson: "Rajesh Kumar",
  email: "rajesh@techcorp.com",
  phone: "+91 98765 43210",
  totalRevenue: 135000,
}

const laptops = [
  {
    id: "LP001",
    model: "ThinkPad E14",
    brand: "Lenovo",
    specs: "i5 8th Gen • 8GB RAM\n256GB SSD • Win10",
    status: "Allotted",
    daysLeft: 15,
    monthlyRent: 3000,
  },
  {
    id: "LP002",
    model: "Inspiron 15",
    brand: "Dell",
    specs: "i7 10th Gen • 16GB RAM\n512GB SSD • Win11",
    status: "Overdue",
    daysOverdue: 5,
    monthlyRent: 4500,
  },
  {
    id: "LP003",
    model: "MacBook Air",
    brand: "Apple",
    specs: "M1 Chip • 8GB RAM\n256GB SSD • macOS",
    status: "Available",
    monthlyRent: 6000,
  },
]

const OrganizationDetailPage = () => {
  const [searchLaptops, setSearchLaptops] = useState("")
  const [activeTab, setActiveTab] = useState("All")

  const getStatusBadge = (laptop) => {
    switch (laptop.status) {
      case "Allotted":
        return <Badge variant="success">Allotted</Badge>
      case "Available":
        return <Badge variant="warning">Available</Badge>
      case "Overdue":
        return <Badge variant="error">Overdue</Badge>
      default:
        return <Badge>{laptop.status}</Badge>
    }
  }

  const getStatusDetails = (laptop) => {
    if (laptop.status === "Allotted") {
      return <div className="text-xs text-gray-500">{laptop.daysLeft} days left</div>
    }
    if (laptop.status === "Overdue") {
      return <div className="text-xs text-red-500">{laptop.daysOverdue} days overdue</div>
    }
    return null
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/organizations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{organizationData.name}</h1>
          <p className="text-gray-600">
            {organizationData.location} • {organizationData.totalLaptops} Laptops • {organizationData.overdue} Overdue
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit Organization
          </Button>
          <Button size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload XLSX
          </Button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Contact Person</div>
          <div className="text-lg font-semibold text-gray-900">{organizationData.contactPerson}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Email</div>
          <div className="text-lg font-semibold text-gray-900">{organizationData.email}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Phone</div>
          <div className="text-lg font-semibold text-gray-900">{organizationData.phone}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Total Revenue</div>
          <div className="text-lg font-semibold text-green-600">₹{organizationData.totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      {/* Laptop Management */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4">
              {["All", "Allotted", "Available"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {tab} (
                  {tab === "All"
                    ? organizationData.totalLaptops
                    : tab === "Allotted"
                      ? organizationData.activeLaptops
                      : organizationData.totalLaptops - organizationData.activeLaptops}
                  )
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                Generate Invoice
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Laptop
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Input
              placeholder="Search laptops..."
              value={searchLaptops}
              onChange={(e) => setSearchLaptops(e.target.value)}
              className="max-w-md"
            />
          </div>
        </div>

        {/* Laptops Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                </th>
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
                  Specs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Rent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {laptops.map((laptop) => (
                <tr key={laptop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{laptop.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{laptop.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{laptop.brand}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="whitespace-pre-line">{laptop.specs}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getStatusBadge(laptop)}
                      {getStatusDetails(laptop)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{laptop.monthlyRent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                        Rent
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
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
          <div className="text-sm text-gray-700">Showing 1 to 3 of 45 laptops</div>
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
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default OrganizationDetailPage
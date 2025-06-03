"use client"

import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { ArrowLeft, Edit, Trash2, Eye, FileText } from "lucide-react"
import  EditProductModal from "../components/edit-product-modal"
import  ExtendRentalModal  from "../components/extend-rental-modal"
import  MarkReturnedModal  from "../components/mark-returned-modal"

const productData = {
  id: "LP001",
  model: "ThinkPad E14",
  brand: "Lenovo",
  serialNumber: "LN123456789",
  processor: "Intel i5 8th Generation",
  memory: "8GB DDR4",
  storage: "256GB SSD",
  operatingSystem: "Windows 10 Pro",
  baseRent: 3000,
  status: "Currently Rented",
  lastUpdated: "March 15, 2024",
  currentAllotment: {
    organization: "TechCorp Solutions",
    location: "Noida, UP",
    handoverDate: "Feb 15, 2024",
    monthlyRent: 3000,
    daysRemaining: 15,
  },
}

const allotmentHistory = [
  {
    id: 1,
    organization: "TechCorp Solutions",
    location: "Noida, UP",
    handoverDate: "Feb 15, 2024",
    returnDate: "-",
    duration: "28 days (ongoing)",
    monthlyRent: 3000,
    status: "Active",
  },
  {
    id: 2,
    organization: "DataSoft Inc",
    location: "Gurgaon, HR",
    handoverDate: "Nov 10, 2023",
    returnDate: "Feb 10, 2024",
    duration: "92 days",
    monthlyRent: 2800,
    status: "Completed",
  },
  {
    id: 3,
    organization: "InnovateTech",
    location: "Delhi, DL",
    handoverDate: "Aug 5, 2023",
    returnDate: "Nov 5, 2023",
    duration: "92 days",
    monthlyRent: 3000,
    status: "Completed",
  },
  {
    id: 4,
    organization: "StartupXYZ",
    location: "Mumbai, MH",
    handoverDate: "May 1, 2023",
    returnDate: "Aug 10, 2023",
    duration: "101 days",
    monthlyRent: 2500,
    status: "Was Overdue",
  },
]

const ProductDetailPage = () => {
  const { id } = useParams()
  const [searchHistory, setSearchHistory] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <span>{productData.id}</span>
            <span>•</span>
            <span>{productData.model}</span>
            <span>•</span>
            <span>{productData.brand}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Product Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{productData.model}</h2>
                <p className="text-gray-600">
                  {productData.brand} • Asset ID: {productData.id}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Serial Number</p>
                  <p className="text-gray-900">{productData.serialNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Processor</p>
                  <p className="text-gray-900">{productData.processor}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Memory (RAM)</p>
                  <p className="text-gray-900">{productData.memory}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Storage</p>
                  <p className="text-gray-900">{productData.storage}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Operating System</p>
                  <p className="text-gray-900">{productData.operatingSystem}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Base Rent</p>
                  <p className="text-2xl font-bold text-green-600">₹{productData.baseRent.toLocaleString()} / month</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Status</p>
                  <Badge variant="success">{productData.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-gray-900">{productData.lastUpdated}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Allotment */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Allotment</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Organization</p>
                <p className="text-gray-900">{productData.currentAllotment.organization}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-gray-900">{productData.currentAllotment.location}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Handover Date</p>
                <p className="text-gray-900">{productData.currentAllotment.handoverDate}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Rent</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{productData.currentAllotment.monthlyRent.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Days Remaining</p>
                <p className="text-gray-900">{productData.currentAllotment.daysRemaining} days</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button className="w-full" onClick={() => setIsExtendModalOpen(true)}>
                Extend Rental
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setIsReturnModalOpen(true)}>
                Mark as Returned
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Allotment History */}
      <div className="mt-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Allotment History</h3>
            <div className="flex gap-3">
              <Input
                placeholder="Search history..."
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                className="w-64"
              />
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm w-40">
                <option>All Records</option>
                <option>Active</option>
                <option>Completed</option>
                <option>Overdue</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handover Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Rent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allotmentHistory.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-900">{record.organization}</div>
                        <div className="text-gray-500">{record.location}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{record.handoverDate}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{record.returnDate}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{record.duration}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{record.monthlyRent.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          record.status === "Active" ? "success" : record.status === "Completed" ? "blue" : "error"
                        }
                      >
                        {record.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                          <FileText className="w-4 h-4 mr-1" />
                          Invoice
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">Showing 1 to 4 of 8 records</div>
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
      <EditProductModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} product={productData} />
      <ExtendRentalModal isOpen={isExtendModalOpen} onClose={() => setIsExtendModalOpen(false)} />
      <MarkReturnedModal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} />
    </div>
  )
}
export default ProductDetailPage
"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { ArrowLeft, Edit, Trash2, Eye, FileText, Upload } from "lucide-react"
import EditProductModal from "../components/edit-product-modal"
import ExtendRentalModal from "../components/extend-rental-modal"
import MarkReturnedModal from "../components/mark-returned-modal"
import BulkUploadModal from "../components/bulk-upload-modal"
import { updateProduct, deleteProduct, fetchProductById, bulkUploadProducts } from "../store/slices/productSlice"

const ProductDetailPage = () => {
  const { id } = useParams()
  const [searchHistory, setSearchHistory] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Get product and history from Redux store
  const { product, allotmentHistory } = useSelector((state) => state.products.currentProduct) || {}
  const loading = useSelector((state) => state.products.loading)
  const error = useSelector((state) => state.products.error)

  // Find the current (active) allotment from history
  const currentAllotment = (allotmentHistory || []).find((a) => a.status === "Active")

  console.log("Product Detail Page Rendered", { product, allotmentHistory })
  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id))
    }
  }, [dispatch, id])

  // Handle Edit
  const handleUpdateProduct = async (formData) => {
    await dispatch(updateProduct({ id: product.id || product._id, productData: formData }))
    setIsEditModalOpen(false)
  }

  // Handle Delete
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await dispatch(deleteProduct(product.id || product._id))
      navigate("/products")
    }
  }

  const handleBulkUpload = async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    await dispatch(bulkUploadProducts(formData))
    setIsBulkModalOpen(false)
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-500">{error}</div>
  if (!product) return <div className="p-8">Product not found.</div>

  // Helper for date formatting
  const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleDateString() : "-")

  // Helper to calculate duration in days between two dates
  const calculateDuration = (handoverDate, surrenderDate) => {
    if (!handoverDate || !surrenderDate) return "-"
    const start = new Date(handoverDate)
    const end = new Date(surrenderDate)
    const diffTime = end - start
    if (isNaN(diffTime)) return "-"
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays + " days" : "1 day"
  }

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
            <span>{product.id}</span>
            <span>•</span>
            <span>{product.model}</span>
            <span>•</span>
            <span>{product.company}</span>
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
                <h2 className="text-2xl font-bold text-gray-900">{product.model}</h2>
                <p className="text-gray-600">
                  {product.company} • Asset ID: {product.id}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-800"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setIsBulkModalOpen(true)}
                >
                  <Upload className="w-4 h-4" />
                  Upload XLSX
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Serial Number</p>
                  <p className="text-gray-900">{product.serialNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Processor</p>
                  <p className="text-gray-900">
                    {product.processor} {product.processorGen && `• ${product.processorGen}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Memory (RAM)</p>
                  <p className="text-gray-900">{product.ram}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Storage</p>
                  <p className="text-gray-900">
                    {product.ssd && `${product.ssd} SSD`}
                    {product.hdd && product.hdd !== "None" && ` + ${product.hdd} HDD`}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Operating System</p>
                  <p className="text-gray-900">{product.windowsVersion}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Base Rent</p>
                  <p className="text-2xl font-bold text-green-600">₹{product.baseRent?.toLocaleString()} / month</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Status</p>
                  <Badge variant="success">{product.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-gray-900">{formatDate(product.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Allotment */}
        {currentAllotment && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Allotment</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Organization</p>
                  <p className="text-gray-900">{currentAllotment.organizationId?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-gray-900">
                    {currentAllotment.organizationId?.location || currentAllotment.location || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Handover Date</p>
                  <p className="text-gray-900">{formatDate(currentAllotment.handoverDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Monthly Rent</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{currentAllotment.rentPer30Days?.toLocaleString() || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge variant={currentAllotment.status === "Active" ? "success" : "warning"}>
                    {currentAllotment.status || "-"}
                  </Badge>
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
        )}
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
                {(allotmentHistory || []).map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-900">{record.organizationId?.name || "-"}</div>
                        <div className="text-gray-500">
                          {record.organizationId?.location || record.location || "-"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.handoverDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.surrenderDate ? formatDate(record.surrenderDate) : "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.surrenderDate && record.handoverDate
          ? calculateDuration(record.handoverDate, record.surrenderDate)
          : "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{record.rentPer30Days?.toLocaleString() || "-"}
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

          {/* Pagination (static for now) */}
       
        </div>
      </div>
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={product}
        onSubmit={handleUpdateProduct}
      />
      <ExtendRentalModal isOpen={isExtendModalOpen} onClose={() => setIsExtendModalOpen(false)} />
      <MarkReturnedModal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} />
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onUpload={handleBulkUpload}
      />
    </div>
  )
}

export default ProductDetailPage
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Upload, Plus, Edit, Trash2, Laptop } from "lucide-react"
import AddProductModal from "../components/add-product-modal"
import EditProductModal from "../components/edit-product-modal"
import BulkUploadModal from "../components/bulk-upload-modal"
import { Link } from "react-router-dom"
import {
  fetchProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  clearError,
  bulkUploadProducts,
} from "../store/slices/productSlice"

const ProductsPage = () => {
  const dispatch = useDispatch()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editProductData, setEditProductData] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const { products, loading, error } = useSelector((state) => state.products)
console.log(products)
  useEffect(() => {
    dispatch(fetchProducts())
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  // Add Product
  const handleAddProduct = async (formData) => {
    await dispatch(createProduct(formData))
    setIsAddModalOpen(false)
  }

  // Edit Product
  const handleEditProduct = (product) => {
    setEditProductData(product)
    setIsEditModalOpen(true)
  }
  const handleUpdateProduct = async (formData) => {
    if (editProductData) {
      await dispatch(updateProduct({ id: editProductData._id, productData: formData }))
      setIsEditModalOpen(false)
      setEditProductData(null)
    }
  }

  // Delete Product
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(id))
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "Rented":
      case "Allotted":
        return <Badge variant="success">{status}</Badge>
      case "Available":
        return <Badge variant="warning">{status}</Badge>
      case "Overdue":
        return <Badge variant="error">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Filter products by search term (id, model, serialNumber)
  const filteredProducts = products.filter((product) =>
    [
      product.id || product._id,
      product.model,
      product.serialNumber
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  // Count products by status
  const totalProducts = products.length
  const availableCount = products.filter(
    (p) => (p.status || "").toLowerCase() === "available"
  ).length
  const rentedCount = products.filter(
    (p) => {
      const status = (p.status || "").toLowerCase()
      return status === "rented" || status === "allotted"
    }
  ).length

  // Bulk Upload
  const handleBulkUpload = async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    await dispatch(bulkUploadProducts(formData))
    setIsBulkModalOpen(false)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setIsBulkModalOpen(true)}
            >
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Laptop className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
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
              <p className="text-2xl font-bold text-gray-900">{rentedCount}</p>
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
              <p className="text-2xl font-bold text-gray-900">{availableCount}</p>
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
        </div>
      </div>

      {/* Error and Loading */}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div className="text-gray-500 mb-4">Loading...</div>}

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
                  Company
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
              {filteredProducts.map((product) => (
                <tr key={product.id || product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/products/${ product._id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                      {product.id || product._id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.company}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="space-y-1">
                      <div>
                        {product.processor} {product.processorGen && `• ${product.processorGen}`} • {product.ram}
                      </div>
                      <div>
                        {product.ssd && `${product.ssd} SSD`} {product.hdd && product.hdd !== "None" && `• ${product.hdd} HDD`} • {product.windowsVersion}
                      </div>
                      <div className="text-xs text-gray-500">SN: {product.serialNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getStatusBadge(product.status)}
                      {product.currentAllotmentId?.organizationId && (
                        <div className="text-xs text-gray-500">
                          Org: {product.currentAllotmentId.organizationId}
                        </div>
                      )}
                      {product.currentAllotmentId?.location && (
                        <div className="text-xs text-gray-500">
                          Location: {product.currentAllotmentId.location}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{product.baseRent?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete( product._id)}
                      >
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
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProduct}
      />

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditProductData(null)
          }}
          product={editProductData}
          onSubmit={handleUpdateProduct}
        />
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onUpload={handleBulkUpload}
      />
    </div>
  )
}

export default ProductsPage
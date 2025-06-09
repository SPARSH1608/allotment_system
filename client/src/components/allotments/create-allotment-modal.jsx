"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useProducts, useOrganizations } from "../../hooks/useRedux"
import { fetchProducts } from "../../store/slices/productSlice"
import { fetchOrganizations } from "../../store/slices/organizationSlice"
import { createAllotment } from "../../store/slices/allotmentSlice"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Modal } from "../ui/modal"

export function CreateAllotmentModal({ isOpen, onClose }) {
  const dispatch = useAppDispatch()
  const { products } = useProducts()
  const { organizations } = useOrganizations()
console.log(organizations)
  // Helper to get next month date string (YYYY-MM-DD), handles year change
  const getNextMonthDate = (dateStr) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = date.getMonth()
    // Set to next month, day stays the same (or last day of next month if needed)
    const nextMonth = new Date(year, month + 1, date.getDate())
    // If day overflows, JS Date auto-corrects to next month, so clamp to last day of next month
    if (nextMonth.getMonth() !== (month + 1) % 12) {
      // Overflowed, so set to last day of next month
      return new Date(year, month + 2, 0).toISOString().split("T")[0]
    }
    return nextMonth.toISOString().split("T")[0]
  }

  const [formData, setFormData] = useState({
    laptopId: "",
    organizationId: "",
    handoverDate: new Date().toISOString().split("T")[0],
    dueDate: getNextMonthDate(new Date().toISOString().split("T")[0]),
    rentPer30Days: "",
    location: "",
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchProducts())
      dispatch(fetchOrganizations())
    }
  }, [isOpen, dispatch])

  // Update dueDate when handoverDate changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      dueDate: getNextMonthDate(prev.handoverDate),
    }))
    // eslint-disable-next-line
  }, [formData.handoverDate])

  // When organizationId changes, set location to organization's location by default
  useEffect(() => {
    if (formData.organizationId) {
      const selectedOrg = organizations.find(org => org._id === formData.organizationId)
      if (selectedOrg && selectedOrg.location && formData.location !== selectedOrg.location) {
        setFormData(prev => ({
          ...prev,
          location: selectedOrg.location
        }))
      }
    }
    // eslint-disable-next-line
  }, [formData.organizationId, organizations])

  // When laptopId changes, set rentPer30Days to product's baseRent by default
  useEffect(() => {
    if (formData.laptopId) {
      const selectedProduct = products.find(prod => prod._id === formData.laptopId)
      if (
        selectedProduct &&
        selectedProduct.baseRent !== undefined &&
        String(formData.rentPer30Days) !== String(selectedProduct.baseRent)
      ) {
        setFormData(prev => ({
          ...prev,
          rentPer30Days: selectedProduct.baseRent
        }))
      }
    }
    // eslint-disable-next-line
  }, [formData.laptopId, products])

  // Filter products to only those with status "Available"
  const availableProducts = products.filter(
    (product) => product.status && product.status.toLowerCase() === "available"
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Convert handoverDate and dueDate to ISO string
      const payload = {
        ...formData,
        handoverDate: new Date(formData.handoverDate).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        rentPer30Days: Number(formData.rentPer30Days),
      }
      await dispatch(createAllotment(payload)).unwrap()
      onClose()
      setFormData({
        laptopId: "",
        organizationId: "",
        handoverDate: new Date().toISOString().split("T")[0],
        dueDate: getNextMonthDate(new Date().toISOString().split("T")[0]),
        rentPer30Days: "",
        location: "",
      })
    } catch (error) {
      console.error("Failed to create allotment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Allotment">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="laptopId">Product *</Label>
            <select
              id="laptopId"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.laptopId}
              onChange={(e) => handleInputChange("laptopId", e.target.value)}
              required
            >
              <option value="">Select Product</option>
              {availableProducts.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.id} - {product.model} ({product.company})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="organizationId">Organization *</Label>
            <select
              id="organizationId"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.organizationId}
              onChange={(e) => handleInputChange("organizationId", e.target.value)}
              required
            >
              <option value="">Select Organization</option>
              {organizations.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="handoverDate">Allotment Date *</Label>
            <Input
              id="handoverDate"
              type="date"
              value={formData.handoverDate}
              onChange={(e) => handleInputChange("handoverDate", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rentPer30Days">Monthly Rent (₹) *</Label>
            <Input
              id="rentPer30Days"
              type="number"
              value={formData.rentPer30Days}
              onChange={(e) => handleInputChange("rentPer30Days", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Allotment"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
export default CreateAllotmentModal
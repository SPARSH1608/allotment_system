
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Modal } from "./ui/modal"

const laptops = [
  { id: "LP001", name: "ThinkPad E14", price: 3000 },
  { id: "LP002", name: "Inspiron 15", price: 4500 },
  { id: "LP003", name: "MacBook Air", price: 6000 },
  { id: "LP004", name: "Pavilion 14", price: 3500 },
  { id: "LP005", name: "VivoBook 15", price: 2800 },
]

const CreateInvoiceModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    organization: "",
    invoiceDate: "2025-06-03",
    dueDate: "2025-07-03",
    billingPeriod: "",
    selectedLaptops: [],
    taxRate: "18",
    discount: "0",
    notes: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Invoice created:", formData)
    onClose()
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLaptopToggle = (laptopId) => {
    setFormData((prev) => ({
      ...prev,
      selectedLaptops: prev.selectedLaptops.includes(laptopId)
        ? prev.selectedLaptops.filter((id) => id !== laptopId)
        : [...prev.selectedLaptops, laptopId],
    }))
  }

  const calculateSubtotal = () => {
    return formData.selectedLaptops.reduce((total, laptopId) => {
      const laptop = laptops.find((l) => l.id === laptopId)
      return total + (laptop ? laptop.price : 0)
    }, 0)
  }

  const subtotal = calculateSubtotal()
  const taxAmount = (subtotal * Number.parseFloat(formData.taxRate || 0)) / 100
  const discountAmount = (subtotal * Number.parseFloat(formData.discount || 0)) / 100
  const total = subtotal + taxAmount - discountAmount

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Invoice">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="organization">Organization *</Label>
            <select
              id="organization"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.organization}
              onChange={(e) => handleInputChange("organization", e.target.value)}
              required
            >
              <option value="">Select Organization</option>
              <option value="techcorp">TechCorp Solutions</option>
              <option value="datasoft">DataSoft Inc</option>
              <option value="innovatetech">InnovateTech</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceDate">Invoice Date *</Label>
            <Input
              id="invoiceDate"
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => handleInputChange("invoiceDate", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <Label htmlFor="billingPeriod">Billing Period</Label>
            <Input
              id="billingPeriod"
              placeholder="e.g., March 2024"
              value={formData.billingPeriod}
              onChange={(e) => handleInputChange("billingPeriod", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Select Laptops</Label>
          <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
            {laptops.map((laptop) => (
              <div key={laptop.id} className="flex items-center space-x-3 py-2">
                <input
                  type="checkbox"
                  id={laptop.id}
                  checked={formData.selectedLaptops.includes(laptop.id)}
                  onChange={() => handleLaptopToggle(laptop.id)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor={laptop.id} className="flex-1 text-sm">
                  {laptop.id} - {laptop.name} (₹{laptop.price.toLocaleString()}/month)
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              value={formData.taxRate}
              onChange={(e) => handleInputChange("taxRate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">Discount (%)</Label>
            <Input
              id="discount"
              type="number"
              value={formData.discount}
              onChange={(e) => handleInputChange("discount", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Additional notes or terms..."
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-md space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax ({formData.taxRate}%):</span>
            <span>₹{taxAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="outline">
            Save as Draft
          </Button>
          <Button type="submit">Create Invoice</Button>
        </div>
      </form>
    </Modal>
  )
}
export default CreateInvoiceModal
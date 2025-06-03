

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Modal } from "./ui/modal"

const EditProductModal = ({ isOpen, onClose, product }) => {
  const [formData, setFormData] = useState({
    assetId: product?.id || "",
    model: product?.model || "",
    serialNumber: product?.serialNumber || "",
    company: product?.brand || "",
    processor: product?.processor || "",
    processorGeneration: "8TH",
    ram: product?.ram || "",
    ssd: product?.storage || "",
    windowsVersion: product?.os || "",
    baseRent: product?.baseRent || "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Product updated:", formData)
    onClose()
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Product">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="assetId">Asset ID</Label>
            <Input
              id="assetId"
              value={formData.assetId}
              onChange={(e) => handleInputChange("assetId", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => handleInputChange("model", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => handleInputChange("serialNumber", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
            >
              <option value="Lenovo">Lenovo</option>
              <option value="Dell">Dell</option>
              <option value="HP">HP</option>
              <option value="Apple">Apple</option>
              <option value="Asus">Asus</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="processor">Processor</Label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.processor}
              onChange={(e) => handleInputChange("processor", e.target.value)}
            >
              <option value="i5">i5</option>
              <option value="i7">i7</option>
              <option value="i3">i3</option>
              <option value="Ryzen 5">Ryzen 5</option>
              <option value="M1 Chip">M1 Chip</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="processorGeneration">Processor Generation</Label>
            <Input
              id="processorGeneration"
              value={formData.processorGeneration}
              onChange={(e) => handleInputChange("processorGeneration", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ram">RAM</Label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.ram}
              onChange={(e) => handleInputChange("ram", e.target.value)}
            >
              <option value="8GB">8GB</option>
              <option value="16GB">16GB</option>
              <option value="32GB">32GB</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ssd">SSD</Label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.ssd}
              onChange={(e) => handleInputChange("ssd", e.target.value)}
            >
              <option value="256GB">256GB</option>
              <option value="512GB">512GB</option>
              <option value="1TB">1TB</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="windowsVersion">Windows Version</Label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.windowsVersion}
              onChange={(e) => handleInputChange("windowsVersion", e.target.value)}
            >
              <option value="Win10">Win10</option>
              <option value="Win11">Win11</option>
              <option value="macOS">macOS</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseRent">Base Rent (₹)</Label>
            <Input
              id="baseRent"
              type="number"
              value={formData.baseRent}
              onChange={(e) => handleInputChange("baseRent", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Modal>
  )
}
export default EditProductModal
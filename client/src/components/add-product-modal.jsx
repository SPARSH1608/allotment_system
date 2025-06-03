

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Modal } from "./ui/modal"

function AddProductModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    assetId: "",
    model: "",
    serialNumber: "",
    company: "",
    processor: "",
    processorGeneration: "",
    ram: "",
    ssd: "",
    hdd: "None",
    windowsVersion: "",
    baseRent: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    onClose()
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Product">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="assetId">Asset ID *</Label>
            <Input
              id="assetId"
              value={formData.assetId}
              onChange={(e) => handleInputChange("assetId", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model *</Label>
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
            <Label htmlFor="serialNumber">Serial Number *</Label>
            <Input
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => handleInputChange("serialNumber", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
            >
              <option value="">Select Brand</option>
              <option value="lenovo">Lenovo</option>
              <option value="dell">Dell</option>
              <option value="hp">HP</option>
              <option value="apple">Apple</option>
              <option value="asus">Asus</option>
              <option value="acer">Acer</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="processor">Processor *</Label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.processor}
              onChange={(e) => handleInputChange("processor", e.target.value)}
            >
              <option value="">Select Processor</option>
              <option value="intel-i3">Intel i3</option>
              <option value="intel-i5">Intel i5</option>
              <option value="intel-i7">Intel i7</option>
              <option value="intel-i9">Intel i9</option>
              <option value="ryzen-3">AMD Ryzen 3</option>
              <option value="ryzen-5">AMD Ryzen 5</option>
              <option value="ryzen-7">AMD Ryzen 7</option>
              <option value="m1">Apple M1</option>
              <option value="m2">Apple M2</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="processorGeneration">Processor Generation</Label>
            <Input
              id="processorGeneration"
              placeholder="e.g., 8TH, 10TH"
              value={formData.processorGeneration}
              onChange={(e) => handleInputChange("processorGeneration", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ram">RAM *</Label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.ram}
              onChange={(e) => handleInputChange("ram", e.target.value)}
            >
              <option value="">Select RAM</option>
              <option value="4gb">4GB DDR4</option>
              <option value="8gb">8GB DDR4</option>
              <option value="16gb">16GB DDR4</option>
              <option value="32gb">32GB DDR4</option>
              <option value="8gb-ddr5">8GB DDR5</option>
              <option value="16gb-ddr5">16GB DDR5</option>
              <option value="32gb-ddr5">32GB DDR5</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ssd">SSD *</Label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.ssd}
              onChange={(e) => handleInputChange("ssd", e.target.value)}
            >
              <option value="">Select SSD</option>
              <option value="128gb">128GB SSD</option>
              <option value="256gb">256GB SSD</option>
              <option value="512gb">512GB SSD</option>
              <option value="1tb">1TB SSD</option>
              <option value="2tb">2TB SSD</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hdd">HDD (Optional)</Label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.hdd}
              onChange={(e) => handleInputChange("hdd", e.target.value)}
            >
              <option value="none">None</option>
              <option value="500gb">500GB HDD</option>
              <option value="1tb">1TB HDD</option>
              <option value="2tb">2TB HDD</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="windowsVersion">Windows Version *</Label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.windowsVersion}
              onChange={(e) => handleInputChange("windowsVersion", e.target.value)}
            >
              <option value="">Select OS</option>
              <option value="windows-10">Windows 10 Pro</option>
              <option value="windows-11">Windows 11 Pro</option>
              <option value="ubuntu">Ubuntu</option>
              <option value="macos">macOS</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="baseRent">Base Rent (₹) *</Label>
          <Input
            id="baseRent"
            type="number"
            value={formData.baseRent}
            onChange={(e) => handleInputChange("baseRent", e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Product</Button>
        </div>
      </form>
    </Modal>
  )
}
export default AddProductModal;
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Modal } from "./ui/modal"

const EditProductModal = ({ isOpen, onClose, product, onSubmit }) => {
  const [formData, setFormData] = useState({
    assetId: "",
    model: "",
    serialNumber: "",
    company: "",
    processor: "",
    processorGen: "",
    ram: "",
    ssd: "",
    hdd: "None",
    windowsVersion: "",
    baseRent: "",
    status: "Available", // Add status to formData
  })

  useEffect(() => {
    if (product) {
      setFormData({
        assetId: product.id || "",
        model: product.model || "",
        serialNumber: product.serialNumber || "",
        company: product.company || "",
        processor: product.processor || "",
        processorGen: product.processorGen || "",
        ram: product.ram || "",
        ssd: product.ssd || "",
        hdd: product.hdd || "None",
        windowsVersion: product.windowsVersion || "",
        baseRent: product.baseRent || "",
        status: product.status || "Available", // Set status from product
      })
    }
  }, [product])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Map formData to product schema
    const updatedProduct = {
      id: formData.assetId,
      model: formData.model,
      serialNumber: formData.serialNumber,
      company: formData.company,
      processor: formData.processor,
      processorGen: formData.processorGen,
      ram: formData.ram,
      ssd: formData.ssd,
      hdd: formData.hdd,
      windowsVersion: formData.windowsVersion,
      baseRent: Number(formData.baseRent),
      status: formData.status, // Use status from formData
      _id: product._id,
    }
    onSubmit(updatedProduct)
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
              required
            >
              <option value="Lenovo">Lenovo</option>
              <option value="Dell">Dell</option>
              <option value="HP">HP</option>
              <option value="Apple">Apple</option>
              <option value="Asus">Asus</option>
              <option value="Acer">Acer</option>
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
              required
            >
              <option value="i3">Intel i3</option>
              <option value="i5">Intel i5</option>
              <option value="i7">Intel i7</option>
              <option value="i9">Intel i9</option>
              <option value="Ryzen 3">AMD Ryzen 3</option>
              <option value="Ryzen 5">AMD Ryzen 5</option>
              <option value="Ryzen 7">AMD Ryzen 7</option>
              <option value="M1 Chip">Apple M1</option>
              <option value="M2 Chip">Apple M2</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="processorGen">Processor Generation</Label>
            <Input
              id="processorGen"
              value={formData.processorGen}
              onChange={(e) => handleInputChange("processorGen", e.target.value)}
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
              required
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
              required
            >
              <option value="128GB">128GB SSD</option>
              <option value="256GB">256GB SSD</option>
              <option value="512GB">512GB SSD</option>
              <option value="1TB">1TB SSD</option>
              <option value="2TB">2TB SSD</option>
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
              <option value="None">None</option>
              <option value="500GB">500GB HDD</option>
              <option value="1TB">1TB HDD</option>
              <option value="2TB">2TB HDD</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="windowsVersion">Windows Version</Label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.windowsVersion}
              onChange={(e) => handleInputChange("windowsVersion", e.target.value)}
              required
            >
              <option value="Win10">Windows 10 Pro</option>
              <option value="Win11">Windows 11 Pro</option>
              <option value="Ubuntu">Ubuntu</option>
              <option value="macOS">macOS</option>
            </select>
          </div>
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
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={formData.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
            required
          >
            <option value="Available">Available</option>
            <option value="Allotted">Allotted</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Retired">Retired</option>
          </select>
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
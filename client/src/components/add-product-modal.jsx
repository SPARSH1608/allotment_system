import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Modal } from "./ui/modal"

const COMPANY_OPTIONS = [
  "Lenovo", "Dell", "HP", "Apple", "Asus", "Acer", "Microsoft", "Samsung", "MSI", "Toshiba", "Fujitsu", "LG", "Sony", "Huawei", "Other"
]
const PROCESSOR_OPTIONS = [
   "I3", "I5", "I7", "I9", "Ryzen 3", "Ryzen 5", "Ryzen 7", "Ryzen 9", "M1", "M2", "M3", "Pentium", "Celeron", "Core 2 Duo", "Xeon", "Other"
]
const RAM_OPTIONS = [
  "2GB", "4GB", "6GB", "8GB", "12GB", "16GB", "20GB", "24GB", "32GB", "64GB", "128GB"
]
const SSD_OPTIONS = [
  "None", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB", "4TB", "8TB"
]
const HDD_OPTIONS = [
  "None", "128GB", "256GB", "320GB", "500GB", "1TB", "2TB", "4TB"
]
const WINDOWS_OPTIONS = [
  "Win7", "Win8", "Win8.1", "Win10", "Win11", "macOS", "Ubuntu", "Fedora", "Debian", "Linux Mint", "Other", "WIN10", "Mac OS"
]

function AddProductModal({ isOpen, onClose, onSubmit }) {
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
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Map formData to product schema
    const product = {
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
      status: "Available",
    }
    onSubmit(product)
    setFormData({
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
    })
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
           
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              required
            >
              <option value="">Select Brand</option>
              {COMPANY_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
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
              required
            >
              <option value="">Select Processor</option>
              {PROCESSOR_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="processorGen">Processor Generation</Label>
            <Input
              id="processorGen"
              placeholder="e.g., 8TH, 10TH"
              value={formData.processorGen}
              onChange={(e) => handleInputChange("processorGen", e.target.value)}
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
              required
            >
              <option value="">Select RAM</option>
              {RAM_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
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
              {SSD_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
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
              {HDD_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="windowsVersion">Windows Version *</Label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.windowsVersion}
              onChange={(e) => handleInputChange("windowsVersion", e.target.value)}
              required
            >
              <option value="">Select OS</option>
              {WINDOWS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
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
export default AddProductModal
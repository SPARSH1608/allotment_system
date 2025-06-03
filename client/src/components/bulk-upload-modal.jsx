
import { useState } from "react"
import { Button } from "./ui/button"
import { Modal } from "./ui/modal"
import { Upload } from "lucide-react"

const BulkUploadModal = ({ isOpen, onClose }) => {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      console.log("File dropped:", files[0])
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files && files[0]) {
      console.log("File selected:", files[0])
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Upload Organizations">
      <div className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload XLSX file</h3>
          <p className="text-sm text-gray-500 mb-4">XLSX files up to 10MB</p>

          <input type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" id="file-upload" />
          <label htmlFor="file-upload">
            <Button type="button" variant="outline" className="cursor-pointer">
              Choose File
            </Button>
          </label>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Upload Options:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Single sheet with organization data</li>
            <li>• Multi-sheet file (each sheet = one organization)</li>
            <li>• Required columns: Name, Location, Contact Person, Email, Phone</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button">Upload & Process</Button>
        </div>
      </div>
    </Modal>
  )
}
export default BulkUploadModal
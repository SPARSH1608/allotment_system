
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Modal } from "./ui/modal"
const ExtendRentalModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    extensionPeriod: "30",
    monthlyRent: "3000",
    notes: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Rental extended:", formData)
    onClose()
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Extend Rental">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="extensionPeriod">Extension Period (Days)</Label>
          <Input
            id="extensionPeriod"
            type="number"
            value={formData.extensionPeriod}
            onChange={(e) => handleInputChange("extensionPeriod", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthlyRent">Monthly Rent (₹)</Label>
          <Input
            id="monthlyRent"
            type="number"
            value={formData.monthlyRent}
            onChange={(e) => handleInputChange("monthlyRent", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            rows={4}
            placeholder="Optional notes..."
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Extend Rental</Button>
        </div>
      </form>
    </Modal>
  )
}
export default ExtendRentalModal
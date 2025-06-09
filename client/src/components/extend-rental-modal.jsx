import { useState  }  from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Modal } from "./ui/modal"
import { useAppDispatch } from "../hooks/useRedux"
import { extendAllotment } from "../store/slices/allotmentSlice"
import React from "react"
const ExtendRentalModal = ({ isOpen, onClose, allotment }) => {
  const dispatch = useAppDispatch()
  const [formData, setFormData] = useState({
    extensionPeriod: "30",
    monthlyRent: allotment?.rentPer30Days?.toString() || "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)

  // Update monthlyRent if allotment changes
  // (so modal works for different allotments without stale rent)
  React.useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      monthlyRent: allotment?.rentPer30Days?.toString() || "",
    }))
  }, [allotment])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await dispatch(
        extendAllotment({
          id: allotment._id,
          extensionData: {
            extensionDays: Number(formData.extensionPeriod),
            newRent: Number(formData.monthlyRent),
            notes: formData.notes,
          },
        })
      ).unwrap()
      onClose()
    } catch (err) {
      // Optionally show error
    } finally {
      setLoading(false)
    }
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
          <Button type="submit" disabled={loading}>
            {loading ? "Extending..." : "Extend Rental"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
export default ExtendRentalModal
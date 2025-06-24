import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Modal } from "./ui/modal"

const AddOrganizationModal = ({ isOpen, onClose, onSubmit, loading, defaultValues }) => {
  const [formData, setFormData] = useState({
    organizationName: "",
    location: "",
    contactPerson: "",
    email: "",
    phone: "",
  })

  // Prefill form when defaultValues change or modal opens
  useEffect(() => {
    if (defaultValues) {
      setFormData({
        organizationName: defaultValues.name || "",
        location: defaultValues.location || "",
        contactPerson: defaultValues.contactPerson || "",
        email: defaultValues.contactEmail || "",
        phone: defaultValues.contactPhone || "",
      })
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        organizationName: "",
        location: "",
        contactPerson: "",
        email: "",
        phone: "",
      })
    }
  }, [defaultValues, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      name: formData.organizationName,
      location: formData.location,
      contactPerson: formData.contactPerson,
      contactEmail: formData.email,
      contactPhone: formData.phone,
    }
    onSubmit(payload)
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={defaultValues ? "Edit Organization" : "Add New Organization"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name</Label>
          <Input
            id="organizationName"
            value={formData.organizationName}
            onChange={(e) => handleInputChange("organizationName", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => handleInputChange("contactPerson", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (defaultValues ? "Saving..." : "Adding...") : (defaultValues ? "Save Changes" : "Add Organization")}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
export default AddOrganizationModal
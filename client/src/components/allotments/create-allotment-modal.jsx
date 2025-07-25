"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useProducts, useOrganizations } from "../../hooks/useRedux";
import { fetchProducts } from "../../store/slices/productSlice";
import { fetchOrganizations } from "../../store/slices/organizationSlice";
import { createAllotment } from "../../store/slices/allotmentSlice";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Modal } from "../ui/modal";

export function CreateAllotmentModal({ isOpen, onClose, defaultOrganizationId }) {
  const dispatch = useAppDispatch();
  const { products } = useProducts();
  const { organizations } = useOrganizations();

  const getNextMonthDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth();
    const nextMonth = new Date(year, month + 1, date.getDate());
    if (nextMonth.getMonth() !== (month + 1) % 12) {
      return new Date(year, month + 2, 0).toISOString().split("T")[0];
    }
    return nextMonth.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    laptopId: "",
    organizationId: defaultOrganizationId || "",
    handoverDate: new Date().toISOString().split("T")[0],
    dueDate: getNextMonthDate(new Date().toISOString().split("T")[0]),
    rentPer30Days: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && defaultOrganizationId) {
      setFormData((prev) => ({
        ...prev,
        organizationId: defaultOrganizationId,
      }));
    }
  }, [isOpen, defaultOrganizationId]);

  useEffect(() => {
    if (isOpen) {
      if (!products || products.length === 0) dispatch(fetchProducts());
      if (!organizations || organizations.length === 0) dispatch(fetchOrganizations());
    }
  }, [isOpen, dispatch, products, organizations]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      dueDate: getNextMonthDate(prev.handoverDate),
    }));
  }, [formData.handoverDate]);

  useEffect(() => {
    if (formData.organizationId) {
      const selectedOrg = organizations.find((org) => org._id === formData.organizationId);
      if (selectedOrg && selectedOrg.location && formData.location !== selectedOrg.location) {
        setFormData((prev) => ({
          ...prev,
          location: selectedOrg.location,
        }));
      }
    }
  }, [formData.organizationId, organizations]);

  useEffect(() => {
    if (formData.laptopId) {
      const selectedProduct = products.find((prod) => prod._id === formData.laptopId);
      if (
        selectedProduct &&
        selectedProduct.baseRent !== undefined &&
        String(formData.rentPer30Days) !== String(selectedProduct.baseRent)
      ) {
        setFormData((prev) => ({
          ...prev,
          rentPer30Days: selectedProduct.baseRent,
        }));
      }
    }
  }, [formData.laptopId, products]);

  const availableProducts = products.filter(
    (product) => product.status && product.status.toLowerCase() === "available"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        handoverDate: new Date(formData.handoverDate).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        rentPer30Days: Number(formData.rentPer30Days),
      };
      await dispatch(createAllotment(payload)).unwrap();
      onClose();
      setFormData({
        laptopId: "",
        organizationId: defaultOrganizationId || "",
        handoverDate: new Date().toISOString().split("T")[0],
        dueDate: getNextMonthDate(new Date().toISOString().split("T")[0]),
        rentPer30Days: "",
        location: "",
      });
    } catch (error) {
      console.error("Failed to create allotment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Allotment">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="laptopId" className="text-xs sm:text-sm">
              Product *
            </Label>
            <select
              id="laptopId"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
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
            <Label htmlFor="organizationId" className="text-xs sm:text-sm">
              Organization *
            </Label>
            <select
              id="organizationId"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
              value={formData.organizationId}
              onChange={(e) => handleInputChange("organizationId", e.target.value)}
              required
              disabled={!!defaultOrganizationId}
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
            <Label htmlFor="handoverDate" className="text-xs sm:text-sm">
              Allotment Date *
            </Label>
            <Input
              id="handoverDate"
              type="date"
              className="text-xs sm:text-sm"
              value={formData.handoverDate}
              onChange={(e) => handleInputChange("handoverDate", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-xs sm:text-sm">
              Due Date *
            </Label>
            <Input
              id="dueDate"
              type="date"
              className="text-xs sm:text-sm"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rentPer30Days" className="text-xs sm:text-sm">
              Monthly Rent (₹) *
            </Label>
            <Input
              id="rentPer30Days"
              type="number"
              className="text-xs sm:text-sm"
              value={formData.rentPer30Days}
              onChange={(e) => handleInputChange("rentPer30Days", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="text-xs sm:text-sm">
              Location *
            </Label>
            <Input
              id="location"
              className="text-xs sm:text-sm"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs sm:text-sm">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="text-xs sm:text-sm">
            {loading ? "Creating..." : "Create Allotment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateAllotmentModal;
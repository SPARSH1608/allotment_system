"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrganizations, createOrganization } from "../store/slices/organizationSlice";
import AddOrganizationModal from "../components/add-organization-model";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { CardContent } from "../components/ui/card";
import { CardHeader } from "../components/ui/card";
import { CardTitle } from "../components/ui/card";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrganizationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { organizations, filters } = useSelector((state) => state.organizations);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  console.log("Organizations:", organizations);

  useEffect(() => {
    dispatch(fetchOrganizations({ search: searchTerm }));
  }, [dispatch, searchTerm]);

  const handleAddOrganization = (orgData) => {
    dispatch(createOrganization(orgData)).then(() => {
      setIsAddModalOpen(false);
      dispatch(fetchOrganizations({ search: searchTerm }));
    });
  };

  const handleOrgClick = (orgId) => {
    if (!orgId) {
      console.error("No organization ID provided");
      return;
    }
    navigate(`/organizations/${orgId}`);
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Organizations</h1>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Organization
        </Button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
      {/* Organizations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {organizations.map((org) => {
          console.log("org", org); // Add this line
          return (
            <Card
              key={org._id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                console.log("Card clicked", org._id);
                handleOrgClick(org._id);
              }}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">{org.name?.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">{org.name}</CardTitle>
                    <p className="text-xs sm:text-sm text-gray-500">{org.location}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-xs sm:text-sm">
                    <span className="text-gray-600">Contact Person:</span>
                    <div className="font-medium">{org.contactPerson}</div>
                  </div>
                  <div className="text-xs sm:text-sm">
                    <span className="text-gray-600">Email:</span>
                    <div className="font-medium">{org.contactEmail}</div>
                  </div>
                  <div className="text-xs sm:text-sm">
                    <span className="text-gray-600">Phone:</span>
                    <div className="font-medium">{org.contactPhone}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-center pt-3 border-t border-gray-200">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{org.stats?.totalLaptops || 0}</div>
                    <div className="text-xs text-gray-500">Total Laptops</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{org.stats?.activeAllotments || 0}</div>
                    <div className="text-xs text-gray-500">Active</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-red-600">{org.stats?.overdueAllotments || 0}</div>
                    <div className="text-xs text-gray-500">Overdue</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Pagination, error, loading, etc. */}
      <AddOrganizationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddOrganization}
      />
    </div>
  );
};

export default OrganizationsPage;
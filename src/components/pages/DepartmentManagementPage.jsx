import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { makeAuthenticatedRequest } from "@/api/axios";
import { Link } from "react-router-dom";
import EnhancedDialog from "@/components/cards/EnhancedDialog";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const departmentFields = [
    {
      name: "name",
      label: "Name",
      type: "text",
    },
    {
      name: "description",
      label: "Description",
      type: "text",
    },
  ];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);

  const handleAddDepartment = () => {
    setCurrentDepartment({ name: "", description: "" }); // Empty department for adding
    setDialogOpen(true);
  };

  const handleEditDepartment = (department) => {
    setCurrentDepartment(department); // Set the department to edit
    setDialogOpen(true);
  };

  const handleSubmit = async (formData) => {
    setProcessing(true);
    try {
      if (currentDepartment?.id) {
        // Update existing department
        await makeAuthenticatedRequest(
          "put",
          `/departments/${currentDepartment.id}`,
          formData
        );
        toast.success("Department updated successfully");
      } else {
        // Create new department
        await makeAuthenticatedRequest("post", "/departments", formData);
        toast.success("Department added successfully");
      }

      // Refresh departments list
      const response = await makeAuthenticatedRequest("get", "/departments");
      setDepartments(response.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save department");
    } finally {
      setProcessing(false);
      setDialogOpen(false);
    }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await makeAuthenticatedRequest("get", "/departments");
        setDepartments(response.data.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch departments");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter((department) => {
    if (statusFilter === "all") return true;
    return department.users?.some((user) => user.status === statusFilter);
  });

  if (loading)
    return (
      <DashboardLayout>
        <div>Loading departments...</div>
      </DashboardLayout>
    );
  if (error)
    return (
      <DashboardLayout>
        <div className="text-center text-red-500">{error}</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Department Management</h1>
        <div className="flex justify-end items-center">
          <Button
            className="bg-[#566f99] hover:bg-[#4a5f85] text-white cursor-pointer"
            onClick={handleAddDepartment}
          >
            Add Department
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. of Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDepartments.map((department) => (
                <tr key={department.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {department.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {department.users?.length || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button
                      variant="outline"
                      className="text-[#566f99] hover:bg-[#4a5f85] hover:text-white cursor-pointer"
                      onClick={() =>
                        handleEditDepartment({
                          id: department.id,
                          name: department.name,
                          description: department.description,
                        })
                      }
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <EnhancedDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={currentDepartment?.id ? "Edit Department" : "Add Department"}
          description={
            currentDepartment?.id
              ? "Update department information"
              : "Create a new department"
          }
          initialData={currentDepartment || {}}
          fields={departmentFields}
          onSubmit={handleSubmit}
          processing={processing}
          submitText={currentDepartment?.id ? "Update" : "Add"}
          cancelText="Cancel"
        />
      </div>
    </DashboardLayout>
  );
};

export default DepartmentManagementPage;

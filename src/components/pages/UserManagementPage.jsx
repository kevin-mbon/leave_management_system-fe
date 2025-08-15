import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import api, { makeAuthenticatedRequest } from "@/api/axios";
import { Button } from "@/components/ui/Button";
import { getAuthToken } from "@/utils/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EnhancedDialog from "../cards/EnhancedDialog";
import { toast } from "react-toastify";

const UserManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const [initialData, setInitialData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    department: "",
    status: "",
  });

  const userFields = [
    {
      name: "firstName",
      label: "First Name",
      type: "text",
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      options: ["ADMIN", "STAFF", "MANAGER"],
    },
    {
      name: "department",
      label: "Department",
      type: "select",
      options: departments,
      required: true,
    },
  ];

  const handleActivateUser = (user) => {
    setInitialData({ ...user, department: user.department?.name });
    setDialogOpen(true);
  };

  const handleSubmit = async (initialData) => {
    setProcessing(true);
    try {
      const userId = initialData.id;

      // Validate department and role before proceeding
      if (
        initialData.status !== "APPROVED" &&
        (!initialData.department || !initialData.role)
      ) {
        toast.error("Please select both department and role");
        setProcessing(false);
        return;
      }

      const endpoint =
        initialData.status === "APPROVED"
          ? `/users/${userId}/reject`
          : `/users/${userId}/approve?department=${initialData.department}&role=${initialData.role}`;

      await makeAuthenticatedRequest("put", endpoint);

      toast.success(
        initialData.status === "APPROVED"
          ? "User has been disabled successfully"
          : "User has been activated successfully"
      );

      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user status");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await makeAuthenticatedRequest("get", "/users");
        console.log(response.data.data);
        setUsers(response.data.data);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchDepartments = async () => {
      const response = await makeAuthenticatedRequest("get", "/departments");
      setDepartments(response.data.data);
    };

    fetchUsers();
    fetchDepartments();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await makeAuthenticatedRequest("patch", `/users/${userId}/status`, {
        status: currentStatus === "active" ? "disabled" : "active",
      });

      // Refresh user list
      const response = await api("get", "/users");
      setUsers(response.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to update user status");
    }
  };

  const filteredUsers = users.filter((user) => {
    if (statusFilter === "all") return true;
    return user.status === statusFilter.toUpperCase();
  });

  if (loading)
    return (
      <DashboardLayout>
        <div>Loading users...</div>
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] bg-white border-none shadow-none focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg rounded-md">
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="approved">Approved Users</SelectItem>
              <SelectItem value="pending">Pending Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.department?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        onClick={() => handleActivateUser(user)}
                        variant="outline"
                        className={
                          user.status === "APPROVED"
                            ? "text-red-600 hover:bg-red-600 hover:text-white cursor-pointer"
                            : "text-green-600 hover:bg-green-600 hover:text-white cursor-pointer"
                        }
                      >
                        {user.status === "APPROVED" ? "Disable" : "Enable"}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No users found with the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <EnhancedDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={
            initialData.status === "APPROVED" ? "Disable User" : "Activate User"
          }
          description={"Control users to access the platform"}
          initialData={initialData}
          fields={userFields}
          onSubmit={handleSubmit}
          processing={processing}
          submitText={
            initialData.status === "APPROVED" ? "Disable" : "Activate"
          }
          cancelText="Cancel"
        />
      </div>
    </DashboardLayout>
  );
};

export default UserManagementPage;

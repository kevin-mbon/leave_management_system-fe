import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { makeAuthenticatedRequest } from "@/api/axios";
import { getAuthToken } from "@/utils/auth";
import { Link } from "react-router-dom";
import EnhancedDialog from "../cards/EnhancedDialog";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const InvitationManagementPage = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const [initialData, setInitialData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    department: "",
  });

  const invitationFields = [
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
    },
  ];

  const handleSubmit = async (formData) => {
    setProcessing(true);
    try {
      const response = await makeAuthenticatedRequest(
        "post",
        "/invitations",
        formData
      );
      toast.success("User invited successfully");
      setInitialData(response.data.data);
    } catch (err) {
      setError("Failed to invite user");
      toast.error("Failed to invite user");
    } finally {
      setProcessing(false);
      setDialogOpen(false);
    }
  };

  const handleInviteUser = () => {
    setDialogOpen(true);
  };

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await makeAuthenticatedRequest("get", "/invitations");
        const invitationData = response.data.data.map((invitation) => ({
          id: invitation.id,
          name: `${invitation.firstName} ${invitation.lastName}`,
          email: invitation.email,
          role: invitation.role,
          used: invitation.used,
          expiryDate: invitation.expiryDate,
        }));
        setInvitations(invitationData);
      } catch (err) {
        setError("Failed to fetch invitations");
      } finally {
        setLoading(false);
      }
    };

    const fetchDepartments = async () => {
      const response = await makeAuthenticatedRequest("get", "/departments");
      setDepartments(response.data.data);
    };

    fetchInvitations();
    fetchDepartments();
  }, []);

  const handleSendInvitation = async (invitationId) => {
    try {
      await makeAuthenticatedRequest(
        "post",
        `/invitations/${invitationId}/send`
      );

      // Refresh invitation list
      const response = await makeAuthenticatedRequest("get", "/invitations");
      setInvitations(response.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to send invitation");
    }
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getInvitationStatus = (invitation) => {
    if (!invitation) return "UNKNOWN";
    if (invitation.used) return "ACCEPTED";
    if (isExpired(invitation.expiryDate)) return "EXPIRED";
    return "PENDING";
  };

  const filteredInvitations = invitations.filter((invitation) => {
    if (statusFilter === "all") return true;

    const status = getInvitationStatus(invitation);
    return status === statusFilter.toUpperCase();
  });

  if (loading)
    return (
      <DashboardLayout>
        <div>Loading invitations...</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Invitation Management</h1>
        <div className="flex justify-end items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] bg-white border-none shadow-none focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg rounded-md">
              <SelectItem value="all">All Invitations</SelectItem>
              <SelectItem value="pending">Pending Invitations</SelectItem>
              <SelectItem value="accepted">Accepted Invitations</SelectItem>
              <SelectItem value="expired">Expired Invitations</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={handleInviteUser}
            className="bg-[#566f99] ml-4 text-white px-4 py-2 rounded-md cursor-pointer"
          >
            Send Invitation
          </button>
        </div>
        <div className="flex items-center justify-end mb-4"></div>
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvitations.length > 0 ? (
                filteredInvitations.map((invitation) => {
                  const status = getInvitationStatus(invitation);
                  return (
                    <tr key={invitation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invitation.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {invitation.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {invitation.role}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            status === "ACCEPTED"
                              ? "bg-green-100 text-green-800"
                              : status === "EXPIRED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {status === "EXPIRED" && (
                          <Button
                            onClick={() => handleSendInvitation(invitation.id)}
                            variant="outline"
                            className="text-blue-600 hover:bg-[#566f99] hover:text-white cursor-pointer"
                          >
                            Resend
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No invitations found with the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <EnhancedDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={"Invite User"}
          description={"Invite a user to the platform"}
          initialData={initialData}
          fields={invitationFields}
          onSubmit={handleSubmit}
          processing={processing}
          submitText={"Invite"}
          cancelText="Cancel"
        />
      </div>
    </DashboardLayout>
  );
};

export default InvitationManagementPage;

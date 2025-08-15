import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { makeAuthenticatedRequest } from "@/api/axios";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import EnhancedDialog from "../cards/EnhancedDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Coins } from "lucide-react";
import AdminEnhancedDialog from "../cards/AdminEnhancedDialog";

const ManagerLeaveManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const { getUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewLeaveDialogOpen, setViewLeaveDialogOpen] = useState(false); // Unused state
  const [processing, setProcessing] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [leaveToApprove, setLeaveToApprove] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [leaveAction, setLeaveAction] = useState(null); // 'APPROVE' or 'REJECT'

  // editLeaveFields is not defined but used in EnhancedDialog component
  const [initialData, setInitialData] = useState({
    startDate: "",
    endDate: "",
    leaveType: "",
    reason: "",
  });

  const [viewLeaveData, setViewLeaveData] = useState({
    id: "",
    startDate: "",
    endDate: "",
    duration: "",
    leaveType: "",
    reason: "",
    status: "",
    createdAt: "",
    respondedBy: "",
    responseDate: "",
    responderComment: "",
  });

  const leaveFields = [
    {
      name: "staffMember",
      label: "Staff Member",
      type: "select",
      options: users.map((user) => ({
        value: String(user.id),
        label: `${user.firstName} ${user.lastName}`,
      })),
      required: true,
    },
    {
      name: "startDate",
      label: "Leave Start Date",
      type: "date",
      min: new Date().toISOString().split("T")[0],
      required: true,
    },
    {
      name: "endDate",
      label: "Leave End Date",
      type: "date",
      min: new Date().toISOString().split("T")[0],
      required: true,
    },
    {
      name: "leaveType",
      label: "Leave Type",
      type: "select",
      options: [
        "PTO",
        "SICK_LEAVE",
        "COMPASSIONATE_LEAVE",
        "MATERNITY_LEAVE",
        "OTHER",
      ],
      required: true,
    },
    {
      name: "reason",
      label: "Leave Reason",
      type: "text",
    },
  ];

  const viewLeaveFields = (leave) => [
    {
      name: "staffMember",
      label: "Staff Member",
      type: "text",
      disabled: true,
    },
    {
      name: "startDate",
      label: "Leave Start Date",
      type: "text",
      disabled: true,
    },
    {
      name: "endDate",
      label: "Leave End Date",
      type: "text",
      disabled: true,
    },
    {
      name: "duration",
      label: "Leave Duration(in days)",
      type: "text",
      disabled: true,
    },
    {
      name: "leaveType",
      label: "Leave Type",
      type: "text",
      disabled: true,
    },
    {
      name: "reason",
      label: "Leave Reason",
      type: "text",
      disabled: true,
    },
    {
      name: "createdAt",
      label: "Leave Request Date",
      type: "text",
      disabled: true,
    },
    {
      name: "respondedBy",
      label: "Responded By",
      type: "text",
      disabled: true,
    },
    {
      name: "responseDate",
      label: "Response Date",
      type: "text",
      disabled: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["APPROVED", "REJECTED", "CANCELLED", "PENDING"],
      defaultValue: leave.status,
      disabled: true,
    },
    {
      name: "responderComment",
      label: "Responder Comment",
      type: "text",
      disabled:
        leave.status === "APPROVED" ||
        leave.status === "REJECTED" ||
        leave.status === "CANCELLED",
      required: leave.status === "REJECTED",
    },
  ];

  const handleRequestLeave = () => {
    setDialogOpen(true);
  };

  const handleViewLeave = (leave) => {
    setViewLeaveData({
      id: leave.id,
      startDate: leave.startDate,
      staffMember: `${leave?.user?.firstName || ""} ${
        leave?.user?.lastName || ""
      }`,
      endDate: leave.endDate,
      duration: leave.duration,
      leaveType: leave.leaveType,
      reason: leave.reason,
      status: leave.status,
      createdAt: leave.createdAt,
      respondedBy: `${leave?.respondedBy?.firstName || ""} ${
        leave?.respondedBy?.lastName || ""
      }`,
      responseDate: leave.responseDate,
      responderComment: leave?.comment,
    });
    setViewLeaveDialogOpen(true);
  };

  const handleRecordManualLeave = async (formData) => {
    setProcessing(true);
    try {
      const body = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        leaveType: formData.leaveType,
        reason: formData.reason,
      };
      const response = await makeAuthenticatedRequest(
        "post",
        `/leaves/record?userId=${formData.staffMember}`,
        body
      );
      toast.success("Leave requested successfully");
      setDialogOpen(false);
      setInitialData({
        startDate: "",
        endDate: "",
        leaveType: "",
        reason: "",
      });
      console.log(formData);
    } catch (err) {
      if (err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to request leave");
      }
    } finally {
      setProcessing(false);
    }
  };

  const confirmApproveLeave = async (formData) => {
    try {
      setProcessing(true);
      console.log("Confirming approval/rejection with data:", formData);

      // Validate that we have a comment for rejection
      if (formData.status === "REJECTED" && !formData.responderComment) {
        toast.error("Please provide a comment to reject a leave");
        return;
      }

      const url =
        formData.status === "APPROVED"
          ? `/leaves/${formData?.id}/respond?status=APPROVED`
          : `/leaves/${formData?.id}/respond?status=REJECTED&comment=${formData?.responderComment}`;

      await makeAuthenticatedRequest("put", url);
      toast.success(
        `Leave ${
          formData.status === "APPROVED" ? "approved" : "rejected"
        } successfully`
      );
      setViewLeaveDialogOpen(false);

      // Refresh the leaves list
      const response = await makeAuthenticatedRequest("get", `/leaves`);
      setLeaves(response.data.data);
    } catch (err) {
      if (err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error(
          `Failed to ${
            formData.status === "APPROVED" ? "approve" : "reject"
          } leave`
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  const confirmCancelLeave = async () => {
    setProcessing(true);
    try {
      await makeAuthenticatedRequest(
        "put",
        `/leaves/cancel/${leaveToApprove.id}`
      );
      toast.success("Leave cancelled successfully");
      setCancelDialogOpen(false);
      // Refresh the leaves list
      const user = getUser();
      const response = await makeAuthenticatedRequest(
        "get",
        `/leaves/user/${user.id}`
      );
      setLeaves(response.data.data);
    } catch (err) {
      if (err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to cancel leave");
      }
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const user = getUser(); // Unused variable
        const response = await makeAuthenticatedRequest("get", `/leaves`);
        setLeaves(response.data.data);
      } catch (err) {
        setError("Failed to fetch leaves");
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await makeAuthenticatedRequest("get", `/users`);
        setUsers(response.data.data);
      } catch (err) {
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
    fetchUsers();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (statusFilter === "all") return true;
    return leave.status === statusFilter.toUpperCase();
  });

  if (loading)
    return (
      <DashboardLayout>
        <div>Loading leaves...</div>
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
        <h1 className="text-2xl font-bold">Manage Leaves</h1>

        <div className="flex items-center justify-end">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] bg-white border-none shadow-none focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg rounded-md">
              <SelectItem value="all">All Leaves</SelectItem>
              <SelectItem value="pending">Pending Leaves</SelectItem>
              <SelectItem value="approved">Approved Leaves</SelectItem>
              <SelectItem value="rejected">Rejected Leaves</SelectItem>
              <SelectItem value="cancelled">Cancelled Leaves</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={handleRequestLeave}
            className="bg-[#566f99] ml-4 text-white px-4 py-2 rounded-md cursor-pointer"
          >
            Record Leave Manually
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
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
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {leave.user
                          ? `${leave.user.firstName} ${leave.user.lastName}`
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(leave.startDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(leave.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {leave.duration} days
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {leave.leaveType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(leave.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          leave.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : leave.status === "REJECTED" ||
                              leave.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        onClick={() => handleViewLeave(leave)}
                        variant="outline"
                        className="text-[#566f99] hover:bg-[#566f99] hover:text-white cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No leave requests found with the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <EnhancedDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title={"Manually Record Leave"}
          description={"Manually record a leave for a staff member"}
          initialData={initialData}
          fields={leaveFields}
          onSubmit={handleRecordManualLeave}
          processing={processing}
          submitText={"Record"}
          cancelText="Cancel"
        />

        <AdminEnhancedDialog
          open={viewLeaveDialogOpen}
          onOpenChange={setViewLeaveDialogOpen}
          title={"Leave Request Information"}
          description={"View leave request information and take actions"}
          initialData={viewLeaveData}
          fields={viewLeaveFields(viewLeaveData)}
          onSubmit={confirmApproveLeave}
          processing={processing}
          submitText={"Record"}
          cancelText="Cancel"
        />
      </div>
    </DashboardLayout>
  );
};

export default ManagerLeaveManagementPage;

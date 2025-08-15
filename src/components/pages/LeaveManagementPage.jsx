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
import ManagerLeaveManagementPage from "./ManagerLeaveManagementPage";

const LeaveManagementPage = () => {
  const { getUser, hasRole } = useAuth();

  // If user is admin or manager, render the manager page
  if (hasRole("ADMIN") || hasRole("MANAGER")) {
    return <ManagerLeaveManagementPage />;
  }

  // Otherwise render the regular user page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [leaveToCancel, setLeaveToCancel] = useState(null);

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
      name: "startDate",
      label: "Leave Start Date",
      type: "date",
      min: new Date().toISOString().split("T")[0],
    },
    {
      name: "endDate",
      label: "Leave End Date",
      type: "date",
      min: new Date().toISOString().split("T")[0],
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
    },
    {
      name: "reason",
      label: "Leave Reason",
      type: "text",
    },
  ];

  const editLeaveFields = [
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
      type: "text",
      disabled: true,
    },
    {
      name: "responderComment",
      label: "Responder Comment",
      type: "text",
      disabled: true,
    },
  ];

  const handleRequestLeave = () => {
    setDialogOpen(true);
  };

  const handleViewLeave = (leave) => {
    setViewLeaveData({
      id: leave.id,
      startDate: leave.startDate,
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
    setEditDialogOpen(true);
  };

  const handleSubmit = async (formData) => {
    setProcessing(true);
    try {
      const response = await makeAuthenticatedRequest(
        "post",
        `/leaves/request`,
        formData
      );
      toast.success("Leave requested successfully");
      setDialogOpen(false);
      setInitialData({
        startDate: "",
        endDate: "",
        leaveType: "",
        reason: "",
      });
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

  const handleCancelLeave = async (formData) => {
    setLeaveToCancel(formData);
    setCancelDialogOpen(true);
  };

  const confirmCancelLeave = async () => {
    setProcessing(true);
    try {
      await makeAuthenticatedRequest(
        "put",
        `/leaves/cancel/${leaveToCancel.id}`
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
        const user = getUser();
        const response = await makeAuthenticatedRequest(
          "get",
          `/leaves/user/${user.id}`
        );
        setLeaves(response.data.data);
      } catch (err) {
        setError("Failed to fetch leaves");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
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
        <h1 className="text-2xl font-bold">My Leaves</h1>

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
            Request Leave
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
          title={"Request Leave"}
          description={"Request a leave"}
          initialData={initialData}
          fields={leaveFields}
          onSubmit={handleSubmit}
          processing={processing}
          submitText={"Request"}
          cancelText="Cancel"
        />

        <EnhancedDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          title={"View Leave"}
          description={"View a leave"}
          initialData={viewLeaveData}
          fields={editLeaveFields}
          onSubmit={handleCancelLeave}
          processing={processing}
          submitText={"Cancel Leave"}
          cancelText="Close"
        />

        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Leave Request</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this leave request? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, keep it</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmCancelLeave}
                disabled={processing}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {processing ? "Cancelling..." : "Yes, cancel it"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default LeaveManagementPage;

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/context/AuthContext";
import { makeAuthenticatedRequest } from "@/api/axios";
const DashboardPage = () => {
  const [date, setDate] = useState(new Date());
  const [analytics, setAnalytics] = useState([]);
  const { getUser, hasRole } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  useEffect(() => {
    const user = getUser();
    // Fetch analytics data when the component mounts or date changes
    const fetchAnalytics = async () => {
      try {
        const response = await makeAuthenticatedRequest(
          "get",
          `/analytics/${user?.id}`,
          null
        );
        setAnalytics(response.data);
        setLoading(false);
        console.log("Analytics data:", response.data);
      } catch (error) {
        setError("Failed to fetch analytics data.");
        console.error("Error fetching analytics:", error);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center">
          <p className="text-lg">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Calendar Card - Takes up 2 columns */}
          <Card className="shadow-md lg:col-span-2 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Calendar</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full max-w-full">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="w-full [&_.rdp-months]:w-full [&_.rdp-month]:w-full [&_.rdp-table]:w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Right side stacked cards - Takes up 3 columns */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="bg-white shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <div className="text-xl">
                    {analytics?.totalLeaveRequests} request(s)
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Personal Time Off Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <div className="text-xl">
                    {20 - analytics?.ptoBalance} day(s) left
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Teammates on Leave(Today)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.teamLeaves.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {analytics.teamLeaves.map((teammate) => (
                      <li key={teammate.id} className="text-lg">
                        {`${teammate.user.firstName} ${teammate.user.lastName}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500">
                    No one in your department on leave today.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;

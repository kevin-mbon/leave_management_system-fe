import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LoginPage from "@/components/pages/LoginPage";
import SignupPage from "@/components/pages/SignupPage";
import DashboardPage from "@/components/pages/DashboardPage";
import LeaveManagementPage from "@/components/pages/LeaveManagementPage";
import UserManagementPage from "@/components/pages/UserManagementPage";
import InvitationManagementPage from "@/components/pages/InvitationManagementPage";
import InviteUser from "@/components/pages/InviteUser";
import SetPasswordPage from "@/components/pages/SetPasswordPage";
import ResendInvitationPage from "@/components/pages/ResendInvitationPage";
import DepartmentManagementPage from "@/components/pages/DepartmentManagementPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/set-password/:token" element={<SetPasswordPage />} />
          <Route path="/resend-invitation" element={<ResendInvitationPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-management"
            element={
              <ProtectedRoute>
                <LeaveManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-management"
            element={
              <ProtectedRoute>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/department-management"
            element={
              <ProtectedRoute>
                <DepartmentManagementPage />
              </ProtectedRoute>
            }
          />
          <Route path="/invitation-management">
            <Route
              index
              element={
                <ProtectedRoute>
                  <InvitationManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="invite"
              element={
                <ProtectedRoute>
                  <InviteUser />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

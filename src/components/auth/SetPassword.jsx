import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import api from "@/api/axios";

const SetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const errors = {};

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (validateForm()) {
      try {
        await api.post("/invitations/confirm", { ...formData, token });

        toast.success("Password set successfully");
        navigate("/login");
      } catch (error) {
        toast.error("Error setting password, try again");
        console.error("Error:", error);
      }
    }
    setIsLoading(false);
  };

  return (
    <Card className="mx-auto p-6 shadow-lg border-none">
      <CardContent className="p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-1">
            Set Your Password to confirm your invite
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(validationErrors).length > 0 && (
            <div className="text-center bg-red-50 text-red-500 p-3 rounded-md text-sm">
              Please fix the errors below
            </div>
          )}
          <div>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`rounded w-full py-2 px-3 mb-4 shadow-sm border ${
                validationErrors.password ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
            {validationErrors.password && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.password}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`rounded w-full py-2 px-3 mb-4 shadow-sm border ${
                validationErrors.confirmPassword
                  ? "border-red-500"
                  : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
            {validationErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#566f99] hover:bg-[#4a5f85] text-white cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Setting Password..." : "Set Password"}
          </Button>
        </form>
        <div className="text-center mt-4">
          <span>Invite expired ?</span>
          <Link
            to="/resend-invitation"
            className="text-blue-500 hover:text-blue-600"
          >
            {" "}
            Request a new one
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SetPassword;

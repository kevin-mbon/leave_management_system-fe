import DashboardLayout from "@/components/layouts/DashboardLayout";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { makeAuthenticatedRequest } from "@/api/axios";
import { toast } from "react-toastify";

const InviteUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    departmentId: "",
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data: response } = await makeAuthenticatedRequest(
          "get",
          "/departments"
        );
        console.log(response);
        setDepartments(response.data);
      } catch (error) {
        setError("Error fetching departments");
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  const validateForm = () => {
    const errors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Role validation
    if (!formData.role) {
      errors.role = "Please select a role";
    }

    // Department validation
    if (!formData.departmentId) {
      errors.departmentId = "Please select a department";
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
    setIsLoading(true);
    e.preventDefault();
    if (validateForm()) {
      const { data: response } = await makeAuthenticatedRequest(
        "post",
        "/invitations",
        { ...formData, departmentId: Number(formData.departmentId) }
      );
      if (response.success) {
        toast.success(response.message);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          role: "",
          departmentId: "",
        });
      } else {
        toast.error(response.message);
      }
    }
    setIsLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Link
          to="/invitation-management"
          className="flex items-center gap-2 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span>Back</span>
        </Link>
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6">Invite New User</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    validationErrors.firstName
                      ? "border-red-500"
                      : "border-gray-300"
                  } p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {validationErrors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    validationErrors.lastName
                      ? "border-red-500"
                      : "border-gray-300"
                  } p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {validationErrors.lastName && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-md border ${
                  validationErrors.email ? "border-red-500" : "border-gray-300"
                } p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full rounded-md border ${
                  validationErrors.role ? "border-red-500" : "border-gray-300"
                } p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              >
                <option value="">Select a role</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="STAFF">Staff</option>
              </select>
              {validationErrors.role && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.role}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Department
              </label>
              <select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className={`w-full rounded-md border ${
                  validationErrors.departmentId
                    ? "border-red-500"
                    : "border-gray-300"
                } p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              >
                <option value="">Select a department</option>
                {departments?.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
              {validationErrors.departmentId && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.departmentId}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-[#566f99] hover:bg-[#4a5f85] text-white cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InviteUser;

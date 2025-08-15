import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
const ResendInvitation = () => {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate email
    if (!email) {
      setValidationError("Email is required");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setValidationError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      // Add your API call here to resend invitation
      console.log("Resending invitation to:", email);
      // toast.success('Invitation has been resent to your email');
    } catch (error) {
      toast.error("Error resending invitation");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto p-6 shadow-lg border-none">
      <CardContent className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">
            Enter your email to receive a new invitation
          </h1>
          {/* <h2 className="text-2xl font-bold mb-6">IST Leave Management System 📧</h2> */}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="text-center bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {validationError}
            </div>
          )}
          <div>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={handleChange}
              className={`rounded w-full py-2 px-3 mb-4 shadow-sm border ${
                validationError ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#566f99] hover:bg-[#4a5f85] text-white cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Resending Invitation..." : "Resend Invitation"}
          </Button>
        </form>
        <div className="text-center mt-4">
          <span>Already have an account ?</span>
          <Link to="/login" className="text-blue-500 hover:text-blue-600">
            {" "}
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResendInvitation;

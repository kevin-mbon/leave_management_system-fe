import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      const result = await signup(firstName, lastName, email, password);
      if (result.success) {
        setSuccessMessage("Registration successful! You will be notified by email when your account is approved.");
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto p-6 shadow-lg border-none">
      <CardContent className="p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-1">Create an account</h1>
          <h2 className="text-2xl font-bold mb-6">Join SheCanCode Leave Management System 👋</h2>
        </div>
        {successMessage ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 text-green-700 rounded-md">
              {successMessage}
            </div>
            <div className="text-sm">
              <Link to="/login" className="text-[#566f99] font-semibold hover:text-[#4a5f85]">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                placeholder="First Name" 
                type="text"
                className="rounded w-full py-2 px-3 mb-4 shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                placeholder="Last Name" 
                type="text"
                className="rounded w-full py-2 px-3 mb-4 shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <input
                placeholder="Email" 
                type="email"
                className="rounded w-full py-2 px-3 mb-4 shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input 
                placeholder="Password" 
                type="password"
                className="rounded w-full py-2 px-3 mb-4 shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input 
                placeholder="Confirm Password" 
                type="password"
                className="rounded w-full py-2 px-3 mb-4 shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button type="submit" disabled={loading} className="w-full bg-[#566f99] hover:bg-[#4a5f85] text-white">
                {loading ? "Signing up..." : "Sign up"}
              </Button>
            </form>
            <div className="text-center mt-4 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[#566f99] font-semibold hover:text-[#4a5f85]">
                Sign In
              </Link>
            </div>
            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-gray-300"></div>
              <span className="mx-2 text-gray-400 text-sm">Or with email</span>
              <div className="flex-grow h-px bg-gray-300"></div>
            </div>
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-50 shadow-sm"
              >
                <FaGoogle size={20} className="text-[#566f99]" />
                <span>Google</span>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SignupForm; 
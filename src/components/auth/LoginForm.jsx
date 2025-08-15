import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const LoginForm = () => {
  const userRef = useRef();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    if (userRef.current) {
      userRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setError('');
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const result = await login(email, password);
      if (result.success) {
        // Navigate to the page they tried to visit or dashboard
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        if (result.error.includes("User is disabled")) {
          setError("Your account is not active. Please contact the administrator.");
        } else {
          setError(result.error || "Login failed. Please try again.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // TODO: Implement Google login logic
    console.log("Google login clicked");
  };

  return (
    <Card className="mx-auto p-6 shadow-lg border-none">
      <CardContent className="p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-1">Hi! Welcome to</h1>
          <h2 className="text-2xl font-bold mb-6">SheCanCode Leave Management System  👋</h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="text-center bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <input
            ref={userRef}
            placeholder="Email" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded w-full py-2 px-3 mb-4 shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input 
            placeholder="Password" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded w-full py-2 px-3 mb-4 shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <Button 
            type="submit" 
            className="w-full bg-[#566f99] hover:bg-[#4a5f85] text-white cursor-pointer"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="text-center mt-4 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#566f99] font-semibold hover:text-[#4a5f85]">
            Sign Up
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
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              "Signing in with Google..."
            ) : (
              <>
                <FaGoogle size={20} className="text-[#566f99]" />
                <span>Google</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
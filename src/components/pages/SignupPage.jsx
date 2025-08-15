import React from "react";
import AuthLayout from "@/components/layouts/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";

const SignupPage = () => {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
};

export default SignupPage; 
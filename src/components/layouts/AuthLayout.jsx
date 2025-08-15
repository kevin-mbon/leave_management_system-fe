import React from "react";
import calendar from "../../assets/calendar.png";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-row lg:flex-row">
      {/* Left Section */}
      <div className="lg:w-1/2 bg-[#566f99] text-white flex flex-col justify-center items-center p-8">
        <div className="relative w-full max-w-sm">
          <img
            src={calendar}
            alt="Card Dark"
            className="absolute top-0 left-10 z-10 w-60 shadow-lg rounded-xl transform rotate-[-6deg]"
          />
          <img
            src={calendar}
            alt="Card Light"
            className="relative z-0 w-60 rounded-xl opacity-50 transform rotate-6"
          />
        </div>
        <div className="mt-12 text-left w-full max-w-sm">
          <h2 className="text-2xl font-semibold">SheCanCode Leave Management System</h2>
        </div>
      </div>

      {/* Right Section - Content will be passed as children */}
      <div className="lg:w-1/2 flex justify-center items-center bg-white p-8">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout; 
import React from 'react'
import Sidebar from "../components/Sidebar";
import RegisterForm from "../components/RegisterationForm"

const Register = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow bg-gray-50 p-10 min-h-screen">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;

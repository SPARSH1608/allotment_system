import React from 'react'
import { useState } from "react";

const RegisterForm = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    password: "",
    confirmPassword: "",
    agreed: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log(form);
    // add API call logic here
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md w-full mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4 text-center">Create your account</h2>
      <p className="text-center text-sm text-gray-500 mb-6">Or sign in to existing account</p>
      <div className="grid grid-cols-2 gap-4">
        <input name="firstName" placeholder="First name" onChange={handleChange} className="input" />
        <input name="lastName" placeholder="Last name" onChange={handleChange} className="input" />
      </div>
      <input name="email" placeholder="Email address" onChange={handleChange} className="input mt-4" />
      <input name="phone" placeholder="Phone number" onChange={handleChange} className="input mt-4" />
      <input name="company" placeholder="Company (optional)" onChange={handleChange} className="input mt-4" />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} className="input mt-4" />
      <input type="password" name="confirmPassword" placeholder="Confirm password" onChange={handleChange} className="input mt-4" />

      <div className="mt-4 flex items-center">
        <input type="checkbox" name="agreed" onChange={handleChange} className="mr-2" />
        <span className="text-sm">
          I agree to the <a href="#" className="text-blue-500 underline">Terms and Conditions</a> and <a href="#" className="text-blue-500 underline">Privacy Policy</a>
        </span>
      </div>

      <button type="submit" className="w-full mt-6 bg-green-600 text-white py-2 rounded">Create Account</button>

      <div className="flex items-center my-4">
        <hr className="flex-1" />
        <span className="px-2 text-sm text-gray-400">Or register with</span>
        <hr className="flex-1" />
      </div>

      <div className="flex gap-4">
        <button type="button" className="w-1/2 border py-2 rounded">Google</button>
        <button type="button" className="w-1/2 border py-2 rounded">GitHub</button>
      </div>
    </form>
  );
};

export default RegisterForm;

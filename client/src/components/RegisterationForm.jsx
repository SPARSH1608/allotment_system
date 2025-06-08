import React, { useState } from "react";

const RegisterForm = ({ onSubmit, loading, error }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    password: "",
    confirmPassword: "",
    agreed: false,
    department: "",
    role: "user", // default role, you can change as needed
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
    if (!form.agreed) {
      alert("You must agree to the Terms and Conditions.");
      return;
    }
    // Prepare data for API
    const payload = {
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      password: form.password,
      role: form.role,
      phone: form.phone,
      department: form.department,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md w-full mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4 text-center">Create your account</h2>
      <p className="text-center text-sm text-gray-500 mb-6">Or sign in to existing account</p>
      <div className="grid grid-cols-2 gap-4">
        <input name="firstName" placeholder="First name" onChange={handleChange} className="input" required />
        <input name="lastName" placeholder="Last name" onChange={handleChange} className="input" required />
      </div>
      <input name="email" type="email" placeholder="Email address" onChange={handleChange} className="input mt-4" required />
      <input name="phone" placeholder="Phone number" onChange={handleChange} className="input mt-4" />
      <input name="department" placeholder="Department" onChange={handleChange} className="input mt-4" required />
      {/* <input name="role" placeholder="Role" onChange={handleChange} className="input mt-4" value={form.role} required /> */}
      <input name="company" placeholder="Company (optional)" onChange={handleChange} className="input mt-4" />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} className="input mt-4" required />
      <input type="password" name="confirmPassword" placeholder="Confirm password" onChange={handleChange} className="input mt-4" required />

      <div className="mt-4 flex items-center">
        <input type="checkbox" name="agreed" onChange={handleChange} className="mr-2" />
        <span className="text-sm">
          I agree to the <a href="#" className="text-blue-500 underline">Terms and Conditions</a> and <a href="#" className="text-blue-500 underline">Privacy Policy</a>
        </span>
      </div>

      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

      <button type="submit" className="w-full mt-6 bg-green-600 text-white py-2 rounded" disabled={loading}>
        {loading ? "Registering..." : "Create Account"}
      </button>

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
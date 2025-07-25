import React, { useEffect } from 'react'
import Sidebar from "../components/Sidebar";
import RegisterForm from "../components/RegisterationForm"
import { useAppDispatch, useAuthLoading, useIsAuthenticated, useAuth } from "../hooks/useRedux"
import { registerUser, clearError } from "../store/slices/authSlice"
import { useNavigate } from "react-router-dom"

const Register = () => {
  const dispatch = useAppDispatch();
  const loading = useAuthLoading();
  const isAuthenticated = useIsAuthenticated();
  const { error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleRegister = (formData) => {
    dispatch(registerUser(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-4 sm:px-6">
      <div className="w-full max-w-sm sm:max-w-md">
        <RegisterForm onSubmit={handleRegister} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default Register;
import React, { useEffect } from 'react'
import Sidebar from "../components/Sidebar";
import RegisterForm from "../components/RegisterationForm"
import { useAppDispatch, useAuthLoading, useIsAuthenticated, useAuth } from "../hooks/useRedux"
import { registerUser, clearError } from "../store/slices/authSlice"
import { useNavigate } from "react-router-dom"

const Register = () => {
  const dispatch = useAppDispatch()
  const loading = useAuthLoading()
  const isAuthenticated = useIsAuthenticated()
  const { error } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleRegister = (formData) => {
    dispatch(registerUser(formData))
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow bg-gray-50 p-10 min-h-screen">
        <RegisterForm onSubmit={handleRegister} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default Register;
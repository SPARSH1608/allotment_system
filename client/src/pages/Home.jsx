import React from 'react'
import { useIsAuthenticated, useAuthUser } from '../hooks/useRedux'
import { Link } from 'react-router-dom'

const Home = () => {
  const isAuthenticated = useIsAuthenticated()
  const user = useAuthUser()

  return (
    <div className="p-4 sm:p-6 md:p-10 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-sm sm:max-w-md w-full mx-auto text-center">
        {isAuthenticated ? (
          <div className="space-y-4">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 text-gray-800">
              Welcome, {user?.name || "User"}!
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Go to your{" "}
              <Link
                to="/dashboard"
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Dashboard
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 text-gray-800">
              Welcome to Universal Network!
            </h1>
            <div className="space-y-4">
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Get started by logging into your account or creating a new one.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base border border-gray-300"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
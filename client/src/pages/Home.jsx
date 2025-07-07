import React from 'react'
import { useIsAuthenticated, useAuthUser } from '../hooks/useRedux'
import { Link } from 'react-router-dom'

const Home = () => {
  const isAuthenticated = useIsAuthenticated()
  const user = useAuthUser()

  return (
    <div className="p-10">
      {isAuthenticated ? (
        <div>
          <h1 className="text-2xl font-bold mb-4">Welcome, {user?.name || "User"}!</h1>
          <p>Go to your <Link to="/dashboard" className="text-blue-600">Dashboard</Link></p>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">Welcome to Universal Network!</h1>
          <p>
            <Link to="/login" className="text-blue-600">Login</Link> or{" "}
            <Link to="/register" className="text-blue-600">Register</Link> to get started.
          </p>
        </div>
      )}
    </div>
  )
}

export default Home
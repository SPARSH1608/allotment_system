const mongoose = require("mongoose")
const User = require("../models/User")
require("dotenv").config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" })

    if (existingAdmin) {
      console.log("Admin user already exists:")
      console.log(`Email: ${existingAdmin.email}`)
      console.log(`Name: ${existingAdmin.name}`)
      process.exit(0)
    }

    // Create admin user
    const adminUser = await User.create({
      name: "System Administrator",
      email: "admin@laptoprent.com",
      password: "Admin123!",
      role: "admin",
      department: "IT",
      phone: "+91 98765 43210",
      isEmailVerified: true,
    })

    console.log("Admin user created successfully:")
    console.log(`Email: ${adminUser.email}`)
    console.log(`Password: Admin123!`)
    console.log(`Role: ${adminUser.role}`)
    console.log("\nPlease change the default password after first login!")

    process.exit(0)
  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1)
  }
}

createAdmin()

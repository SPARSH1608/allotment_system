const mongoose = require("mongoose")
const User = require("../models/User")
require("dotenv").config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const sampleUsers = [
  {
    name: "System Administrator",
    email: "admin@laptoprent.com",
    password: "Admin123!",
    role: "admin",
    department: "IT",
    phone: "+91 98765 43210",
    isEmailVerified: true,
  },
  {
    name: "John Manager",
    email: "manager@laptoprent.com",
    password: "Manager123!",
    role: "manager",
    department: "Operations",
    phone: "+91 87654 32109",
    isEmailVerified: true,
  },
  {
    name: "Jane User",
    email: "user@laptoprent.com",
    password: "User123!",
    role: "user",
    department: "Sales",
    phone: "+91 76543 21098",
    isEmailVerified: true,
  },
  {
    name: "Mike Smith",
    email: "mike@laptoprent.com",
    password: "User123!",
    role: "user",
    department: "Marketing",
    phone: "+91 65432 10987",
    isEmailVerified: true,
  },
  {
    name: "Sarah Johnson",
    email: "sarah@laptoprent.com",
    password: "Manager123!",
    role: "manager",
    department: "Finance",
    phone: "+91 54321 09876",
    isEmailVerified: true,
  },
]

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({})
    console.log("Cleared existing users")

    // Insert sample users
    await User.insertMany(sampleUsers)
    console.log("Users seeded successfully")

    console.log("\nDefault user credentials:")
    console.log("Admin: admin@laptoprent.com / Admin123!")
    console.log("Manager: manager@laptoprent.com / Manager123!")
    console.log("User: user@laptoprent.com / User123!")

    process.exit(0)
  } catch (error) {
    console.error("Error seeding users:", error)
    process.exit(1)
  }
}

seedUsers()

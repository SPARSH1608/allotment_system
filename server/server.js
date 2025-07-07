const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const cookieParser = require("cookie-parser")
require("dotenv").config()

// Import routes
const authRoutes = require("./routes/authRoutes")
const productRoutes = require("./routes/productRoutes")
const organizationRoutes = require("./routes/organizationRoutes")
const allotmentRoutes = require("./routes/allotmentRoutes")
const surrenderRoutes = require("./routes/surrenderRoutes")
const invoiceRoutes = require("./routes/invoiceRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes")
const uploadRoutes = require("./routes/uploadRoutes")

// // Import middleware
// const errorHandler = require("./middleware/errorHandler")
const { connectDB } = require("./config/db")

const app = express()
connectDB();
// app.get('/', (req, res) => {
//     res.send('API');
//   });
// // Security middleware
// app.use(helmet())

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// })
// app.use(limiter)


app.use(
  cors({
    origin: [,
      process.env.CLIENT_URL || "http://localhost:5173"
    ],
    credentials: true,
  }),
)

// Body parser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true}))

// Cookie parser
// app.use(cookieParser())



// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/organizations", organizationRoutes)
app.use("/api/allotments", allotmentRoutes)
app.use("/api/surrenders", surrenderRoutes)
app.use("/api/invoices", invoiceRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/upload", uploadRoutes)

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware
// app.use(errorHandler)

// Handle 404
// app.use("*", (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//   })
// })

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app

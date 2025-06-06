const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (phone) => {
          if (!phone) return true // Optional field
          return /^[+]?[1-9][\d]{0,15}$/.test(phone)
        },
        message: "Please enter a valid phone number",
      },
    },
    department: {
      type: String,
      trim: true,
    },
    permissions: {
      products: {
        read: { type: Boolean, default: true },
        write: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      organizations: {
        read: { type: Boolean, default: true },
        write: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      allotments: {
        read: { type: Boolean, default: true },
        write: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      invoices: {
        read: { type: Boolean, default: true },
        write: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      dashboard: {
        read: { type: Boolean, default: true },
      },
    },
  },
  {
    timestamps: true,
  },
)

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex")

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000 // 10 minutes

  return resetToken
}

// Set default permissions based on role
userSchema.pre("save", function (next) {
  if (this.isModified("role")) {
    switch (this.role) {
      case "admin":
        this.permissions = {
          products: { read: true, write: true, delete: true },
          organizations: { read: true, write: true, delete: true },
          allotments: { read: true, write: true, delete: true },
          invoices: { read: true, write: true, delete: true },
          dashboard: { read: true },
        }
        break
      case "manager":
        this.permissions = {
          products: { read: true, write: true, delete: false },
          organizations: { read: true, write: true, delete: false },
          allotments: { read: true, write: true, delete: false },
          invoices: { read: true, write: true, delete: false },
          dashboard: { read: true },
        }
        break
      case "user":
        this.permissions = {
          products: { read: true, write: false, delete: false },
          organizations: { read: true, write: false, delete: false },
          allotments: { read: true, write: false, delete: false },
          invoices: { read: true, write: false, delete: false },
          dashboard: { read: true },
        }
        break
    }
  }
  next()
})

// Index for better performance
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })

module.exports = mongoose.model("User", userSchema)

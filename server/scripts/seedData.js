const mongoose = require("mongoose")
const Product = require("../models/Product")
const Organization = require("../models/Organization")
const Allotment = require("../models/Allotment")
require("dotenv").config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Sample data
const sampleProducts = [
  {
    id: "LP001",
    model: "ThinkPad E14",
    serialNumber: "LN123456789",
    company: "Lenovo",
    processor: "i5",
    processorGen: "8TH",
    ram: "8GB",
    ssd: "256GB",
    hdd: "None",
    windowsVersion: "Win10",
    baseRent: 3000,
  },
  {
    id: "LP002",
    model: "Inspiron 15",
    serialNumber: "DL987654321",
    company: "Dell",
    processor: "i7",
    processorGen: "10TH",
    ram: "16GB",
    ssd: "512GB",
    hdd: "None",
    windowsVersion: "Win11",
    baseRent: 4500,
  },
  {
    id: "LP003",
    model: "MacBook Air",
    serialNumber: "AP456789123",
    company: "Apple",
    processor: "M1",
    processorGen: "M1",
    ram: "8GB",
    ssd: "256GB",
    hdd: "None",
    windowsVersion: "macOS",
    baseRent: 6000,
  },
  {
    id: "LP004",
    model: "Pavilion 14",
    serialNumber: "HP789123456",
    company: "HP",
    processor: "i5",
    processorGen: "11TH",
    ram: "8GB",
    ssd: "512GB",
    hdd: "None",
    windowsVersion: "Win11",
    baseRent: 3500,
  },
  {
    id: "LP005",
    model: "VivoBook 15",
    serialNumber: "AS321654987",
    company: "Asus",
    processor: "Ryzen 5",
    processorGen: "4TH",
    ram: "16GB",
    ssd: "256GB",
    hdd: "None",
    windowsVersion: "Win10",
    baseRent: 2800,
  },
]

const sampleOrganizations = [
  {
    id: "ORG001",
    name: "TechCorp Solutions",
    location: "Noida, UP",
    contactPerson: "Rajesh Kumar",
    contactEmail: "rajesh@techcorp.com",
    contactPhone: "+91 98765 43210",
  },
  {
    id: "ORG002",
    name: "DataSoft Inc",
    location: "Gurgaon, HR",
    contactPerson: "Priya Sharma",
    contactEmail: "priya@datasoft.com",
    contactPhone: "+91 87654 32109",
  },
  {
    id: "ORG003",
    name: "InnovateTech",
    location: "Delhi, DL",
    contactPerson: "Amit Singh",
    contactEmail: "amit@innovatetech.com",
    contactPhone: "+91 76543 21098",
  },
  {
    id: "ORG004",
    name: "StartupXYZ",
    location: "Mumbai, MH",
    contactPerson: "Neha Patel",
    contactEmail: "neha@startupxyz.com",
    contactPhone: "+91 65432 10987",
  },
]

const seedData = async () => {
  try {
    // Clear existing data
    await Product.deleteMany({})
    await Organization.deleteMany({})
    await Allotment.deleteMany({})

    console.log("Cleared existing data")

    // Insert sample data
    await Product.insertMany(sampleProducts)
    console.log("Products seeded")

    await Organization.insertMany(sampleOrganizations)
    console.log("Organizations seeded")

    // Create some sample allotments
    const sampleAllotments = [
      {
        id: "ALT0001",
        laptopId: "LP001",
        organizationId: "ORG001",
        handoverDate: new Date("2024-02-15"),
        rentPer30Days: 3000,
        currentMonthDays: 30,
        location: "Noida, UP",
        status: "Active",
      },
      {
        id: "ALT0002",
        laptopId: "LP002",
        organizationId: "ORG002",
        handoverDate: new Date("2024-01-20"),
        rentPer30Days: 4500,
        currentMonthDays: 30,
        location: "Gurgaon, HR",
        status: "Overdue",
      },
    ]

    await Allotment.insertMany(sampleAllotments)
    console.log("Allotments seeded")

    // Update product statuses
    await Product.findOneAndUpdate({ id: "LP001" }, { status: "Allotted" })
    await Product.findOneAndUpdate({ id: "LP002" }, { status: "Allotted" })

    console.log("Data seeding completed successfully")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding data:", error)
    process.exit(1)
  }
}

seedData()

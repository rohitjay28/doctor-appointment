const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const dotenv     = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const appointmentRoutes = require("./routes/Appointments");
const authRoutes        = require("./routes/Auth");
const adminRoutes       = require("./routes/Admin");

app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth",         authRoutes);
app.use("/api/admin",        adminRoutes);

// Public stats route (no auth) — for homepage
app.get("/api/stats", async (req, res) => {
  try {
    const Appointment = require("./models/Appointment");
    const total = await Appointment.countDocuments();
    res.json({ success: true, total });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// MongoDB connect
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
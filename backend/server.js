const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const dotenv     = require("dotenv");

dotenv.config();

// #region agent log
function agentDebugLog(runId, hypothesisId, location, message, data) {
  if (typeof fetch === "function") {
    fetch("http://127.0.0.1:7457/ingest/f2a721f8-535f-440e-a3a4-8ad21046a655", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "9467b0",
      },
      body: JSON.stringify({
        sessionId: "9467b0",
        runId,
        hypothesisId,
        location,
        message,
        data,
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
}
// #endregion

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
const mongoUri = process.env.MONGODB_URI || "";

agentDebugLog(
  "run1",
  "H1",
  "backend/server.js:35",
  "About to connect to MongoDB",
  {
    hasUri: !!mongoUri,
    uriLength: mongoUri.length,
    usesSrv: mongoUri.startsWith("mongodb+srv://"),
    containsAtlasDomain: mongoUri.includes(".mongodb.net"),
  }
);

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    agentDebugLog(
      "run1",
      "H1",
      "backend/server.js:38",
      "MongoDB connection error",
      {
        name: err.name,
        code: err.code,
        errno: err.errno,
        syscall: err.syscall,
        hostname: err.hostname,
      }
    );
    console.log("❌ MongoDB error:", err);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
const express = require("express");
const router  = express.Router();
const Appointment = require("../models/Appointment");
const authMiddleware = require("../middleware/authMiddleware");

// All routes below are protected
router.use(authMiddleware);

// GET /api/admin/appointments — get all appointments
router.get("/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/admin/stats — dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const total     = await Appointment.countDocuments();
    const confirmed = await Appointment.countDocuments({ status: "Confirmed" });
    const pending   = await Appointment.countDocuments({ status: "Pending"   });
    const cancelled = await Appointment.countDocuments({ status: "Cancelled" });

    // Today's appointments
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const today = await Appointment.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    res.json({ success: true, stats: { total, confirmed, pending, cancelled, today } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH /api/admin/appointments/:id/status — update status
router.patch("/appointments/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Confirmed", "Pending", "Cancelled", "Completed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/admin/appointments/:id — delete appointment
router.delete("/appointments/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
    res.json({ success: true, message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
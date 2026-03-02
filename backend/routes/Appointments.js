const express = require('express');
const Appointment = require('../models/Appointment');
const { sendConfirmationEmail } = require('../config/email');

const router = express.Router();

// POST /api/appointments - Book appointment
router.post('/', async (req, res) => {
  try {
    const { patientName, patientEmail, patientPhone, department, doctor, appointmentDate, message } = req.body;

    if (!patientName || !patientEmail || !patientPhone || !department || !doctor || !appointmentDate) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Save to MongoDB
    const appointment = await Appointment.create({
      patientName, patientEmail, patientPhone,
      department, doctor, appointmentDate, message,
    });

    // Send confirmation email
    await sendConfirmationEmail(appointment);

    res.status(201).json({
      success: true,
      message: 'Appointment booked! Confirmation email sent to ' + patientEmail,
      appointment,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// GET /api/appointments - Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
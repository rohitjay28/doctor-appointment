const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName:     { type: String, required: true },
  patientEmail:    { type: String, required: true },
  patientPhone:    { type: String, required: true },
  department:      { type: String, required: true },
  doctor:          { type: String, required: true },
  appointmentDate: { type: String, required: true },
  message:         { type: String, default: '' },
  status:          { type: String, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
const nodemailer = require('nodemailer');

const sendConfirmationEmail = async (appointment) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Doctor Appointment" <${process.env.EMAIL_USER}>`,
      to: appointment.patientEmail,
      subject: '✅ Appointment Confirmed - Doctor Appointment',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #1c4980; text-align: center;">Appointment Confirmed ✅</h2>
          <p>Dear <strong>${appointment.patientName}</strong>,</p>
          <p>Your appointment has been successfully booked!</p>
          <table style="width:100%; border-collapse:collapse; margin: 20px 0;">
            <tr style="background:#f5f5f5;">
              <td style="padding:10px; border:1px solid #ddd;"><strong>Patient Name</strong></td>
              <td style="padding:10px; border:1px solid #ddd;">${appointment.patientName}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #ddd;"><strong>Email</strong></td>
              <td style="padding:10px; border:1px solid #ddd;">${appointment.patientEmail}</td>
            </tr>
            <tr style="background:#f5f5f5;">
              <td style="padding:10px; border:1px solid #ddd;"><strong>Phone</strong></td>
              <td style="padding:10px; border:1px solid #ddd;">${appointment.patientPhone}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #ddd;"><strong>Department</strong></td>
              <td style="padding:10px; border:1px solid #ddd;">${appointment.department}</td>
            </tr>
            <tr style="background:#f5f5f5;">
              <td style="padding:10px; border:1px solid #ddd;"><strong>Doctor</strong></td>
              <td style="padding:10px; border:1px solid #ddd;">${appointment.doctor}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #ddd;"><strong>Date & Time</strong></td>
              <td style="padding:10px; border:1px solid #ddd;">${appointment.appointmentDate}</td>
            </tr>
            <tr style="background:#f5f5f5;">
              <td style="padding:10px; border:1px solid #ddd;"><strong>Status</strong></td>
              <td style="padding:10px; border:1px solid #ddd; color:green;"><strong>Confirmed ✅</strong></td>
            </tr>
          </table>
          <p style="color:#666;">Please arrive 10 minutes before your appointment.</p>
          <div style="text-align:center; margin-top:20px; padding:10px; background:#1c4980; border-radius:5px;">
            <p style="color:white; margin:0;">Doctor Appointment | Your Trusted Health Partner</p>
          </div>
        </div>
      `,
    });

    console.log('✅ Email sent to:', appointment.patientEmail);
    return true;
  } catch (err) {
    console.error('❌ Email error:', err.message);
    return false;
  }
};

module.exports = { sendConfirmationEmail };
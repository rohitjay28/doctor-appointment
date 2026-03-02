import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../Styles/AppointmentForm.css";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

// Department → Doctors mapping
const DOCTORS_BY_DEPT = {
  Nephrology:               ["Dr. Dilip M Babu"],
  Cardiology:               ["Dr. C. Raghu"],
  "Gynaecology & Obstetrics": ["Dr. Bagyalakshmi A.D.S"],
  ENT:                      ["Dr. Nagendra Mahendra"],
};

// AM/PM time slots
const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM",
];

function AppointmentForm() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [patientName,    setPatientName]    = useState("");
  const [patientEmail,   setPatientEmail]   = useState("");
  const [patientNumber,  setPatientNumber]  = useState("");
  const [patientGender,  setPatientGender]  = useState("default");
  const [department,     setDepartment]     = useState("default");
  const [doctor,         setDoctor]         = useState("default");
  const [appointmentDate,setAppointmentDate]= useState("");
  const [appointmentTime,setAppointmentTime]= useState("default");
  const [preferredMode,  setPreferredMode]  = useState("default");
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [formErrors,     setFormErrors]     = useState({});

  // When department changes reset doctor
  const handleDepartmentChange = (e) => {
    setDepartment(e.target.value);
    setDoctor("default");
  };

  const validate = () => {
    const errors = {};
    if (!patientName.trim())          errors.patientName    = "Patient name is required";
    if (!patientEmail.trim())         errors.patientEmail   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(patientEmail))
                                      errors.patientEmail   = "Enter a valid email";
    if (!patientNumber.trim())        errors.patientNumber  = "Phone number is required";
    else if (patientNumber.trim().length !== 10)
                                      errors.patientNumber  = "Phone number must be 10 digits";
    if (patientGender === "default")  errors.patientGender  = "Please select gender";
    if (department === "default")     errors.department     = "Please select department";
    if (doctor === "default")         errors.doctor         = "Please select doctor";
    if (!appointmentDate)             errors.appointmentDate= "Please select appointment date";
    else {
      const selected = new Date(appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // ✅ Allow today's date
      if (selected < today) errors.appointmentDate = "Past dates are not allowed";
    }
    if (appointmentTime === "default")errors.appointmentTime= "Please select appointment time";
    if (preferredMode === "default")  errors.preferredMode  = "Please select preferred mode";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post("http://localhost:5000/api/appointments", {
        patientName,
        patientEmail,
        patientPhone:    patientNumber,
        department,
        doctor,
        appointmentDate: `${appointmentDate} at ${appointmentTime}`,
        message:         `Gender: ${patientGender} | Mode: ${preferredMode}`,
      });

      if (res.data.success) {
        // Reset all fields
        setPatientName("");
        setPatientEmail("");
        setPatientNumber("");
        setPatientGender("default");
        setDepartment("default");
        setDoctor("default");
        setAppointmentDate("");
        setAppointmentTime("default");
        setPreferredMode("default");
        setFormErrors({});

        toast.success(
          `✅ Appointment Confirmed! Confirmation email sent to ${patientEmail}`,
          { position: toast.POSITION.TOP_CENTER }
        );
      }
    } catch (err) {
      toast.error("❌ Failed to book appointment. Please try again.", {
        position: toast.POSITION.TOP_CENTER,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableDoctors =
    department !== "default" ? DOCTORS_BY_DEPT[department] || [] : [];

  // ✅ Today's date in YYYY-MM-DD for min attribute
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="appointment-form-section">
      <h1 className="legal-siteTitle">
        <Link to="/">
          Doctor Appointment <span className="legal-siteSign">+</span>
        </Link>
      </h1>

      <div className="form-container">
        <h2 className="form-title">
          <span>Book Appointment Online</span>
        </h2>

        <form className="form-content" onSubmit={handleSubmit}>

          {/* Patient Name */}
          <label>
            Patient Full Name:
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter full name"
            />
            {formErrors.patientName && <p className="error-message">{formErrors.patientName}</p>}
          </label><br />

          {/* Patient Email */}
          <label>
            Patient Email:
            <input
              type="email"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              placeholder="Enter email address"
            />
            {formErrors.patientEmail && <p className="error-message">{formErrors.patientEmail}</p>}
          </label><br />

          {/* Patient Phone */}
          <label>
            Patient Phone Number:
            <input
              type="text"
              value={patientNumber}
              onChange={(e) => setPatientNumber(e.target.value)}
              placeholder="10-digit phone number"
            />
            {formErrors.patientNumber && <p className="error-message">{formErrors.patientNumber}</p>}
          </label><br />

          {/* Gender */}
          <label>
            Patient Gender:
            <select value={patientGender} onChange={(e) => setPatientGender(e.target.value)}>
              <option value="default">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="private">I will inform Doctor only</option>
            </select>
            {formErrors.patientGender && <p className="error-message">{formErrors.patientGender}</p>}
          </label><br />

          {/* Department */}
          <label>
            Select Department:
            <select value={department} onChange={handleDepartmentChange}>
              <option value="default">Select Department</option>
              {Object.keys(DOCTORS_BY_DEPT).map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {formErrors.department && <p className="error-message">{formErrors.department}</p>}
          </label><br />

          {/* Doctor — shows only after department selected */}
          {department !== "default" && (
            <>
              <label>
                Select Doctor:
                <select value={doctor} onChange={(e) => setDoctor(e.target.value)}>
                  <option value="default">Select Doctor</option>
                  {availableDoctors.map((doc) => (
                    <option key={doc} value={doc}>{doc}</option>
                  ))}
                </select>
                {formErrors.doctor && <p className="error-message">{formErrors.doctor}</p>}
              </label><br />
            </>
          )}

          {/* Appointment Date - ✅ min set to today */}
          <label>
            Appointment Date:
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              min={todayStr}
            />
            {formErrors.appointmentDate && <p className="error-message">{formErrors.appointmentDate}</p>}
          </label><br />

          {/* Appointment Time - AM/PM slots */}
          <label>
            Preferred Time:
            <select value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)}>
              <option value="default">Select Time Slot</option>
              <optgroup label="Morning">
                {TIME_SLOTS.filter(t => t.includes("AM")).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </optgroup>
              <optgroup label="Afternoon / Evening">
                {TIME_SLOTS.filter(t => t.includes("PM")).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </optgroup>
            </select>
            {formErrors.appointmentTime && <p className="error-message">{formErrors.appointmentTime}</p>}
          </label><br />

          {/* Preferred Mode */}
          <label>
            Preferred Mode:
            <select value={preferredMode} onChange={(e) => setPreferredMode(e.target.value)}>
              <option value="default">Select</option>
              <option value="In-Person">In-Person Visit</option>
              <option value="Voice Call">Voice Call</option>
              <option value="Video Call">Video Call</option>
            </select>
            {formErrors.preferredMode && <p className="error-message">{formErrors.preferredMode}</p>}
          </label><br />

          <button
            type="submit"
            className="text-appointment-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Booking..." : "Confirm Appointment"}
          </button>

        </form>
      </div>

      <div className="legal-footer">
        <p>© 2000-2026 Doctor Appointment+. All rights reserved.</p>
      </div>

      <ToastContainer autoClose={5000} limit={1} closeButton={false} />
    </div>
  );
}

export default AppointmentForm;
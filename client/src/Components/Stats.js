import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Styles/Stats.css";

function Stats() {
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [counted, setCounted] = useState(0);

  useEffect(() => {
    axios.get("http://localhost:5000/api/stats")
      .then(res => {
        if (res.data.success) {
          setTotal(res.data.total);
          setLoading(false);
        }
      })
      .catch(() => { setTotal(0); setLoading(false); });
  }, []);

  // Count-up animation
  useEffect(() => {
    if (loading || total === 0) return;
    let start = 0;
    const step = Math.ceil(total / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= total) { setCounted(total); clearInterval(timer); }
      else setCounted(start);
    }, 25);
    return () => clearInterval(timer);
  }, [total, loading]);

  const stats = [
    { icon: "👨‍⚕️", value: "4",        label: "Expert Doctors",      color: "#0ea5e9" },
    { icon: "🏥", value: "4",        label: "Departments",          color: "#10b981" },
    { icon: "📅", value: loading ? "..." : counted.toString(), label: "Appointments Booked", color: "#f59e0b" },
    { icon: "⭐", value: "4.9",      label: "Patient Rating",       color: "#8b5cf6" },
  ];

  return (
    <section className="stats-section">
      <div className="stats-container">
        <h2 className="stats-title">Trusted by Patients Across the City</h2>
        <p className="stats-subtitle">Real numbers, real care.</p>

        <div className="stats-grid">
          {stats.map((s, i) => (
            <div className="stat-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}>
                {s.icon}
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
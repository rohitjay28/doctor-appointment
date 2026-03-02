import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminLogin() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => {
    if (localStorage.getItem("adminToken")) navigate("/admin/dashboard");
    setTimeout(() => setMounted(true), 50);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter email and password"); return; }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      if (res.data.success) {
        localStorage.setItem("adminToken", res.data.token);
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={{
        ...styles.card,
        opacity:    mounted ? 1 : 0,
        transform:  mounted ? "translateY(0) scale(1)" : "translateY(40px) scale(0.97)",
        transition: "all .6s cubic-bezier(.22,1,.36,1)",
      }}>
        <div style={styles.logo}>
          <div style={{ fontSize: 36 }}>🏥</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>Doctor Appointment</div>
            <div style={{ fontSize: 12, color: "#0ea5e9", fontWeight: 600 }}>Admin Portal</div>
          </div>
        </div>

        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Sign in to your admin dashboard</p>

        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrap}>
              <span style={{ fontSize: 16, marginRight: 10 }}>📧</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@doctorappoint.com"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <span style={{ fontSize: 16, marginRight: 10 }}>🔒</span>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Admin@1234"
                style={styles.input}
              />
              <button type="button" onClick={() => setShowPass(s => !s)} style={styles.eyeBtn}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? "⏳ Signing in..." : "Sign In →"}
          </button>
        </form>

        <p style={styles.footer}>Doctor Appointment+ © 2026 · Admin Access Only</p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #64748b; }
        input:focus { outline: none; }
        button { transition: all .2s; }
        button:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}

const styles = {
  root:       { minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  blob1:      { position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.15), transparent 70%)", top: "-100px", left: "-100px", pointerEvents: "none" },
  blob2:      { position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)", bottom: "-100px", right: "-100px", pointerEvents: "none" },
  card:       { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "40px 36px", width: "100%", maxWidth: 420, backdropFilter: "blur(20px)", position: "relative", zIndex: 1 },
  logo:       { display: "flex", alignItems: "center", gap: 12, marginBottom: 28 },
  title:      { fontSize: 26, fontWeight: 800, color: "#e2e8f0", marginBottom: 6 },
  subtitle:   { fontSize: 14, color: "#64748b", marginBottom: 28 },
  errorBox:   { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#fca5a5", marginBottom: 20 },
  form:       { display: "flex", flexDirection: "column", gap: 18 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label:      { fontSize: 13, fontWeight: 600, color: "#94a3b8" },
  inputWrap:  { display: "flex", alignItems: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "0 14px" },
  input:      { flex: 1, background: "transparent", border: "none", color: "#e2e8f0", fontSize: 14, padding: "13px 0", outline: "none" },
  eyeBtn:     { background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: "0 0 0 8px" },
  submitBtn:  { marginTop: 8, padding: "14px", background: "linear-gradient(135deg, #0ea5e9, #6366f1)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" },
  footer:     { marginTop: 28, textAlign: "center", fontSize: 12, color: "#334155" },
};

export default AdminLogin;
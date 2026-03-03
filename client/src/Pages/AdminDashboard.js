import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const STATUS_COLOR = {
  Confirmed: { bg: "#d1fae5", color: "#065f46" },
  Pending:   { bg: "#fef3c7", color: "#92400e" },
  Cancelled: { bg: "#fee2e2", color: "#991b1b" },
  Completed: { bg: "#e0e7ff", color: "#3730a3" },
};

const STATUS_ICON = {
  Confirmed: "✅",
  Pending:   "⏳",
  Cancelled: "❌",
  Completed: "🏁",
};

const MODE_ICON = { "In-Person": "🏥", "Video Call": "📹", "Voice Call": "📞" };

const autoCompleteAppointments = (appointments) => {
  const now = new Date();
  return appointments.map(a => {
    const raw = a.appointmentDate?.replace(" at ", " ");
    const apptDate = new Date(raw);
    if (!isNaN(apptDate) && apptDate < now) {
      if (a.status === "Confirmed") return { ...a, status: "Completed" };
      if (a.status === "Pending")   return { ...a, status: "Cancelled" };
    }
    return a;
  });
};

function AdminDashboard() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("adminToken");

  const [appointments,  setAppointments]  = useState([]);
  const [stats,         setStats]         = useState({ total: 0, confirmed: 0, pending: 0, cancelled: 0, completed: 0, today: 0 });
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState("All");
  const [filterDept,    setFilterDept]    = useState("All");
  const [sortField,     setSortField]     = useState("createdAt");
  const [sortDir,       setSortDir]       = useState("desc");
  const [page,          setPage]          = useState(1);
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast,         setToast]         = useState(null);
  const [mounted,       setMounted]       = useState(false);
  const PER_PAGE = 6;

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` },
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const computeStats = (appts) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    return {
      total:     appts.length,
      confirmed: appts.filter(a => a.status === "Confirmed").length,
      pending:   appts.filter(a => a.status === "Pending").length,
      cancelled: appts.filter(a => a.status === "Cancelled").length,
      completed: appts.filter(a => a.status === "Completed").length,
      today:     appts.filter(a => {
        const d = new Date(a.createdAt);
        return d >= today && d <= todayEnd;
      }).length,
    };
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/appointments");
      const raw  = res.data.appointments;
      const processed = autoCompleteAppointments(raw);
      setAppointments(processed);
      setStats(computeStats(processed));
      processed.forEach((a, i) => {
        if (raw[i].status !== a.status) {
          api.patch(`/admin/appointments/${a._id}/status`, { status: a.status })
            .catch(() => {});
        }
      });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
      setTimeout(() => setMounted(true), 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    if (!token) { navigate("/admin/login"); return; }
    fetchData();
  }, [token, navigate, fetchData]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/", {replace: true}); //go to homepage
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/admin/appointments/${id}/status`, { status });
      setAppointments(prev => {
        const updated = prev.map(a => a._id === id ? { ...a, status } : a);
        setStats(computeStats(updated));
        return updated;
      });
      showToast(`Status updated to ${status}`);
    } catch { showToast("Failed to update status", "error"); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/appointments/${id}`);
      setAppointments(prev => {
        const updated = prev.filter(a => a._id !== id);
        setStats(computeStats(updated));
        return updated;
      });
      setDeleteConfirm(null);
      showToast("Appointment deleted", "error");
    } catch { showToast("Failed to delete", "error"); }
  };

  const depts    = ["All", ...new Set(appointments.map(a => a.department))];
  const filtered = appointments
    .filter(a => {
      const q = search.toLowerCase();
      return (
        (filterStatus === "All" || a.status === filterStatus) &&
        (filterDept   === "All" || a.department === filterDept) &&
        (a.patientName?.toLowerCase().includes(q)  ||
         a.patientEmail?.toLowerCase().includes(q) ||
         a.doctor?.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      const va = a[sortField] || "", vb = b[sortField] || "";
      return sortDir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
    setPage(1);
  };

  const SortIcon = ({ field }) => (
    <span style={{ marginLeft: 4, opacity: sortField === field ? 1 : 0.3, fontSize: 10 }}>
      {sortField === field ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );

  const deptBreakdown = appointments.reduce((acc, a) => {
    if (a.department) acc[a.department] = (acc[a.department] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={S.root}>
      <div style={S.bgGradient} />

      {toast && (
        <div style={{ ...S.toast, background: toast.type === "error" ? "#ef4444" : "#10b981" }}>
          {toast.type === "error" ? "🗑️" : "✅"} {toast.msg}
        </div>
      )}

      {deleteConfirm && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Delete Appointment?</h3>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setDeleteConfirm(null)} style={S.cancelBtn}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={S.deleteBtn}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <aside style={{ ...S.sidebar, width: sidebarOpen ? 240 : 70 }}>
        <div style={S.sidebarTop}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 26 }}>🏥</span>
            {sidebarOpen && <span style={S.logoText}>DocAdmin</span>}
          </div>
          <button onClick={() => setSidebarOpen(o => !o)} style={S.toggleBtn}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav style={{ flex: 1, padding: "16px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { icon: "📊", label: "Dashboard"    },
            { icon: "📅", label: "Appointments" },
            { icon: "👨‍⚕️", label: "Doctors"      },
            { icon: "⚙️", label: "Settings"     },
          ].map((item, i) => (
            <div key={i} style={{ ...S.navItem, background: i === 0 ? "rgba(14,165,233,0.15)" : "transparent", borderLeft: i === 0 ? "3px solid #0ea5e9" : "3px solid transparent" }}>
              <span style={{ fontSize: 18, minWidth: 24, textAlign: "center" }}>{item.icon}</span>
              {sidebarOpen && <span style={{ marginLeft: 12, fontSize: 14, fontWeight: 500 }}>{item.label}</span>}
            </div>
          ))}
        </nav>

        <button onClick={handleLogout} style={S.logoutBtn}>
          <span>🚪</span>
          {sidebarOpen && <span style={{ marginLeft: 10 }}>Logout</span>}
        </button>
      </aside>

      <main style={{ ...S.main, marginLeft: sidebarOpen ? 240 : 70 }}>
        <header style={{ ...S.header, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-20px)", transition: "all .5s ease" }}>
          <div>
            <h1 style={S.headerTitle}>Admin Dashboard</h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={S.searchBar}>
              <span style={{ color: "#94a3b8", marginRight: 8 }}>🔍</span>
              <input
                placeholder="Search patients, doctors..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={S.searchInput}
              />
            </div>
            <div style={S.adminBadge}>
              <div style={S.adminAvatar}>A</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Admin</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, fontSize: 16, color: "#64748b" }}>
            ⏳ Loading dashboard data...
          </div>
        ) : (
          <>
            <div style={S.statsGrid}>
              {[
                { label: "Total Bookings", value: stats.total,     icon: "📋", color: "#0ea5e9", delay: 0   },
                { label: "Confirmed",      value: stats.confirmed, icon: "✅", color: "#10b981", delay: 0.1 },
                { label: "Completed",      value: stats.completed, icon: "🏁", color: "#6366f1", delay: 0.2 },
                { label: "Pending",        value: stats.pending,   icon: "⏳", color: "#f59e0b", delay: 0.3 },
                { label: "Cancelled",      value: stats.cancelled, icon: "❌", color: "#ef4444", delay: 0.4 },
                { label: "Today",          value: stats.today,     icon: "📅", color: "#8b5cf6", delay: 0.5 },
              ].map((s, i) => (
                <div key={i} style={{ ...S.statCard, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(30px)", transition: `all .5s ease ${s.delay}s` }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
                  </div>
                  <div style={{ height: 4, background: `${s.color}22`, borderRadius: 2, overflow: "hidden", marginTop: "auto" }}>
                    <div style={{ height: "100%", background: s.color, width: stats.total > 0 ? `${Math.round((s.value / stats.total) * 100)}%` : "0%", borderRadius: 2, transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={S.filterRow}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Status:</span>
                {["All", "Confirmed", "Completed", "Pending", "Cancelled"].map(s => (
                  <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }} style={{ ...S.chip, background: filterStatus === s ? "#0ea5e9" : "rgba(255,255,255,0.07)", color: filterStatus === s ? "#fff" : "#94a3b8", border: filterStatus === s ? "1px solid #0ea5e9" : "1px solid rgba(255,255,255,0.1)" }}>
                    {STATUS_ICON[s] || "🔍"} {s}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Dept:</span>
                <select value={filterDept} onChange={e => { setFilterDept(e.target.value); setPage(1); }} style={S.select}>
                  {depts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>{filtered.length} records</span>
            </div>

            <div style={{ ...S.tableCard, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all .6s ease .5s" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>📋 Appointment Records</h2>
                <div style={{ fontSize: 12, color: "#64748b" }}>🏁 Past appointments auto-marked as Completed</div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {[
                        { label: "#",           field: null              },
                        { label: "Patient",     field: "patientName"     },
                        { label: "Doctor",      field: "doctor"          },
                        { label: "Department",  field: "department"      },
                        { label: "Date & Time", field: "appointmentDate" },
                        { label: "Mode",        field: null              },
                        { label: "Status",      field: "status"          },
                        { label: "Actions",     field: null              },
                      ].map(col => (
                        <th key={col.label} onClick={() => col.field && handleSort(col.field)} style={{ ...S.th, cursor: col.field ? "pointer" : "default" }}>
                          {col.label}{col.field && <SortIcon field={col.field} />}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#64748b" }}>No appointments found 🔍</td></tr>
                    ) : paginated.map((a, i) => (
                      <tr key={a._id}>
                        <td style={S.td}><span style={S.idBadge}>#{i + 1 + (page - 1) * PER_PAGE}</span></td>
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ ...S.avatar, background: `hsl(${(a.patientName?.charCodeAt(0) || 65) * 5}, 60%, 45%)` }}>
                              {a.patientName?.[0] || "?"}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{a.patientName}</div>
                              <div style={{ fontSize: 11, color: "#64748b" }}>{a.patientEmail}</div>
                              <div style={{ fontSize: 11, color: "#64748b" }}>📱 {a.patientPhone}</div>
                            </div>
                          </div>
                        </td>
                        <td style={S.td}><span style={{ fontWeight: 600, color: "#0ea5e9", fontSize: 13 }}>{a.doctor}</span></td>
                        <td style={S.td}><span style={S.deptBadge}>{a.department}</span></td>
                        <td style={S.td}><span style={{ fontSize: 12, color: "#94a3b8" }}>{a.appointmentDate}</span></td>
                        <td style={S.td}><span style={{ fontSize: 12 }}>{MODE_ICON[a.message?.split("Mode: ")[1]] || "🏥"} {a.message?.split("Mode: ")[1] || "In-Person"}</span></td>
                        <td style={S.td}>
                          <select
                            value={a.status || "Pending"}
                            onChange={e => handleStatusChange(a._id, e.target.value)}
                            style={{ ...S.statusSelect, background: STATUS_COLOR[a.status || "Pending"]?.bg, color: STATUS_COLOR[a.status || "Pending"]?.color }}
                          >
                            <option value="Confirmed">✅ Confirmed</option>
                            <option value="Completed">🏁 Completed</option>
                            <option value="Pending">⏳ Pending</option>
                            <option value="Cancelled">❌ Cancelled</option>
                          </select>
                        </td>
                        <td style={S.td}>
                          <button onClick={() => setDeleteConfirm(a._id)} style={S.deleteRowBtn}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={S.pageBtn}>← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)} style={{ ...S.pageBtn, background: page === p ? "#0ea5e9" : "rgba(255,255,255,0.07)", color: page === p ? "#fff" : "#94a3b8" }}>{p}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={S.pageBtn}>Next →</button>
                </div>
              )}
            </div>

            <div style={S.deptGrid}>
              {Object.entries(deptBreakdown).map(([dept, count], i) => {
                const colors = ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6"];
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={dept} style={S.deptCard}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors[i % 4], flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{dept}</div>
                      <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: colors[i % 4], width: `${pct}%`, transition: "width 1s ease", borderRadius: 2 }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: colors[i % 4], flexShrink: 0 }}>{count}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        tr:hover td { background: rgba(14,165,233,0.04) !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        select option { background: #1e293b; color: #e2e8f0; }
      `}</style>
    </div>
  );
}

const S = {
  root:        { display: "flex", minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#e2e8f0", position: "relative", overflow: "hidden" },
  bgGradient:  { position: "fixed", inset: 0, background: "radial-gradient(ellipse at 20% 20%, rgba(14,165,233,0.08), transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.06), transparent 50%)", pointerEvents: "none" },
  sidebar:     { position: "fixed", top: 0, left: 0, height: "100vh", background: "#0d1526", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", zIndex: 100, transition: "width .3s ease", overflow: "hidden" },
  sidebarTop:  { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" },
  logoText:    { fontSize: 18, fontWeight: 800, background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  toggleBtn:   { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 12 },
  navItem:     { display: "flex", alignItems: "center", padding: "10px 12px", borderRadius: 10, cursor: "pointer", color: "#94a3b8" },
  logoutBtn:   { margin: 16, padding: "10px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", fontSize: 14, fontWeight: 500 },
  main:        { flex: 1, padding: 28, minHeight: "100vh", transition: "margin-left .3s ease" },
  header:      { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 },
  headerTitle: { fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg, #e2e8f0, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  searchBar:   { display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "8px 14px", width: 260 },
  searchInput: { background: "transparent", border: "none", outline: "none", color: "#e2e8f0", fontSize: 14, width: "100%" },
  adminBadge:  { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "8px 14px" },
  adminAvatar: { width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 },
  statsGrid:   { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 },
  statCard:    { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12 },
  filterRow:   { display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" },
  chip:        { padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all .2s" },
  select:      { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", borderRadius: 8, padding: "5px 10px", fontSize: 12, outline: "none" },
  tableCard:   { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden", marginBottom: 24 },
  th:          { padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid rgba(255,255,255,0.07)", whiteSpace: "nowrap", userSelect: "none" },
  td:          { padding: "14px 16px", fontSize: 13, borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle" },
  idBadge:     { background: "rgba(255,255,255,0.07)", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600 },
  avatar:      { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0, color: "#fff" },
  deptBadge:   { background: "rgba(139,92,246,0.15)", color: "#a78bfa", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500 },
  statusSelect:{ padding: "4px 8px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", outline: "none" },
  deleteRowBtn:{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 14 },
  pageBtn:     { padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.07)", color: "#94a3b8", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  deptGrid:    { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 },
  deptCard:    { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 },
  overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modal:       { background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 32, textAlign: "center", width: 320 },
  cancelBtn:   { padding: "10px 24px", borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", cursor: "pointer", fontWeight: 600, fontSize: 14 },
  deleteBtn:   { padding: "10px 24px", borderRadius: 10, background: "#ef4444", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 },
  toast:       { position: "fixed", top: 24, right: 24, padding: "12px 20px", borderRadius: 12, color: "#fff", fontWeight: 600, fontSize: 14, zIndex: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" },
};

export default AdminDashboard;
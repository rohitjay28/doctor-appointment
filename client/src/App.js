import React from "react";
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import "./App.css";
import Home        from "./Pages/Home";
import Legal       from "./Pages/Legal";
import NotFound    from "./Pages/NotFound";
import Appointment from "./Pages/Appointment";
import AdminLogin     from "./Pages/AdminLogin";
import AdminDashboard from "./Pages/AdminDashboard";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/"                element={<Home />}           />
          <Route path="/legal"           element={<Legal />}          />
          <Route path="/appointment"     element={<Appointment />}    />
          <Route path="/admin/login"     element={<AdminLogin />}     />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*"                element={<NotFound />}       />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
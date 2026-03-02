const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const adminEmail    = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret     = process.env.JWT_SECRET;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { email, role: "admin" },
    jwtSecret,
    { expiresIn: "1d" }
  );

  res.json({ success: true, token, message: "Login successful" });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

module.exports = router;
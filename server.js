require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname)));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FIELDS = ["firstName", "lastName", "email", "phone", "service", "date", "location", "message"];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

app.post("/api/contact", async (req, res) => {
  const data = {};
  for (const field of FIELDS) {
    data[field] = typeof req.body[field] === "string" ? req.body[field].trim() : "";
  }

  if (FIELDS.some((field) => !data[field])) {
    return res.status(400).json({ error: "Please fill in all fields." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return res.status(400).json({ error: "Please enter a valid email." });
  }

  const safe = Object.fromEntries(FIELDS.map((field) => [field, escapeHtml(data[field])]));

  const mailOptions = {
    from: `"FunPower Events Website" <${process.env.SMTP_USER}>`,
    to: process.env.MAIL_TO,
    replyTo: data.email,
    subject: `New request from ${data.firstName} ${data.lastName}`.replace(/[\r\n]+/g, " "),
    html: `
      <h2>New request from the website</h2>
      <table cellpadding="8" style="border-collapse:collapse; width:100%; max-width:500px;">
        <tr><td><b>Name</b></td><td>${safe.firstName} ${safe.lastName}</td></tr>
        <tr><td><b>Email</b></td><td>${safe.email}</td></tr>
        <tr><td><b>Phone</b></td><td>${safe.phone}</td></tr>
        <tr><td><b>Service</b></td><td>${safe.service}</td></tr>
        <tr><td><b>Event date</b></td><td>${safe.date}</td></tr>
        <tr><td><b>Location</b></td><td>${safe.location}</td></tr>
        <tr><td><b>Message</b></td><td style="white-space:pre-wrap;">${safe.message}</td></tr>
      </table>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[${new Date().toISOString()}] Request sent from ${data.email}`);
    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to send email:", err.message);
    res.status(500).json({ error: "Could not send your message. Please try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});

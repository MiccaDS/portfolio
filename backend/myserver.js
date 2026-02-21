require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Create Nodemailer transporter (use Gmail or another service)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER,        // your Gmail address
    pass: process.env.EMAIL_PASS         // App Password (NOT normal password!)
  }
});

// Form submission endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, company, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const mailOptions = {
    from: `"Portfolio Contact" <${email}>`,
    to: process.env.EMAIL_USER,           // where YOU receive it
    replyTo: email,
    subject: `New message from ${name}`,
    text: `
Name: ${name}
Email: ${email}
Company: ${company || '—'}
Message:
${message}

Sent: ${new Date().toISOString()}
    `,
    html: `
      <h2>New Contact Form Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company:</strong> ${company || '—'}</p>
      <p><strong>Message:</strong></p>
      <pre style="background:#f1f5f9; padding:1rem; border-radius:6px;">${message}</pre>
      <hr>
      <small>Sent at ${new Date().toLocaleString()}</small>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
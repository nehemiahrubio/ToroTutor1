// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Define your appointment schema fields
  title: String,
  date: Date,
  // ... other fields
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
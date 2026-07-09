const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true }, // stored as "HH:MM" (24h)
  reason: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['Scheduled', 'Cancelled'],
    default: 'Scheduled',
  },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);

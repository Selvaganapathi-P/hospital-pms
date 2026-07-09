const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  department: {
    type: String,
    required: true,
    enum: ['Cardiology', 'Orthopaedics', 'Neurology', 'General Medicine', 'Pediatrics'],
  },
  qualification: { type: String, required: true, trim: true },
  experience: { type: Number, required: true, min: [0, 'Experience cannot be negative'] },
  consultationFee: { type: Number, required: true, min: [0, 'Fee cannot be negative'] },
  mobile: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Mobile must be exactly 10 digits'],
  },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);

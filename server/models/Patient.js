const mongoose = require('mongoose');

// Patient IDs are auto-generated: PAT-0001, PAT-0002, etc.
const patientSchema = new mongoose.Schema({
  patientId: { type: String, unique: true },
  fullName: { type: String, required: true, trim: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  dob: { type: Date, required: true },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Phone must be exactly 10 digits'],
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  address: { type: String, required: true, trim: true },
}, { timestamps: true });

patientSchema.pre('save', async function (next) {
  if (this.patientId) return next();
  const count = await mongoose.model('Patient').countDocuments();
  this.patientId = `PAT-${String(count + 1).padStart(4, '0')}`;
  next();
});

module.exports = mongoose.model('Patient', patientSchema);

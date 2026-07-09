/**
 * Seed script — MongoDB equivalent of a SQL dump.
 * Clears all collections and inserts sample data.
 * Run: npm run seed  (make sure .env is set up first)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // wipe existing data and drop collections to reset indexes
  await Promise.all([
    User.deleteMany({}),
    Patient.collection.drop().catch(() => {}),
    Doctor.deleteMany({}),
    Appointment.deleteMany({}),
  ]);
  console.log('Cleared all collections');

  // ── Users ───────────────────────────────────────────
  const users = await User.create([
    { name: 'Admin Staff', email: 'admin@hospital.com', password: 'admin123' },
    { name: 'Reception Desk', email: 'reception@hospital.com', password: 'reception123' },
  ]);
  console.log(`Seeded ${users.length} users`);

  // ── Doctors ─────────────────────────────────────────
  const doctors = await Doctor.create([
    { name: 'Dr. Arjun Mehta', department: 'Cardiology', qualification: 'MBBS, MD (Cardiology)', experience: 12, consultationFee: 800, mobile: '9876543210' },
    { name: 'Dr. Priya Sharma', department: 'Neurology', qualification: 'MBBS, DM (Neurology)', experience: 9, consultationFee: 900, mobile: '9876543211' },
    { name: 'Dr. Ravi Kumar', department: 'Orthopaedics', qualification: 'MBBS, MS (Ortho)', experience: 15, consultationFee: 700, mobile: '9876543212' },
    { name: 'Dr. Sunita Patel', department: 'General Medicine', qualification: 'MBBS, MD', experience: 7, consultationFee: 500, mobile: '9876543213' },
    { name: 'Dr. Ananya Iyer', department: 'Pediatrics', qualification: 'MBBS, MD (Pediatrics)', experience: 10, consultationFee: 600, mobile: '9876543214' },
  ]);
  console.log(`Seeded ${doctors.length} doctors`);

  // ── Patients ─────────────────────────────────────────
  // Create one by one so the pre-save patientId counter increments correctly
  const patientData = [
    { fullName: 'Rohan Singh', gender: 'Male', dob: new Date('1990-05-15'), phone: '9000000001', email: 'rohan@example.com', bloodGroup: 'B+', address: '12 MG Road, Bengaluru' },
    { fullName: 'Meera Nair', gender: 'Female', dob: new Date('1985-11-22'), phone: '9000000002', email: 'meera@example.com', bloodGroup: 'A+', address: '45 Park Street, Mumbai' },
    { fullName: 'Kiran Rao', gender: 'Male', dob: new Date('2000-03-08'), phone: '9000000003', email: 'kiran@example.com', bloodGroup: 'O+', address: '8 Anna Salai, Chennai' },
    { fullName: 'Sneha Verma', gender: 'Female', dob: new Date('1978-07-30'), phone: '9000000004', email: 'sneha@example.com', bloodGroup: 'AB-', address: '22 Civil Lines, Delhi' },
    { fullName: 'Aditya Joshi', gender: 'Male', dob: new Date('1995-01-14'), phone: '9000000005', email: 'aditya@example.com', bloodGroup: 'O-', address: '3 Banjara Hills, Hyderabad' },
  ];
  const patients = [];
  for (const data of patientData) {
    const p = await Patient.create(data);
    patients.push(p);
  }
  console.log(`Seeded ${patients.length} patients`);

  // ── Appointments ──────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextDay = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };
  const prevDay = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
  };

  const appointments = await Appointment.create([
    // today's appointments
    { patient: patients[0]._id, doctor: doctors[0]._id, appointmentDate: today, appointmentTime: '09:00', reason: 'Chest pain follow-up', status: 'Scheduled' },
    { patient: patients[1]._id, doctor: doctors[1]._id, appointmentDate: today, appointmentTime: '11:00', reason: 'Migraine consultation', status: 'Scheduled' },
    // upcoming
    { patient: patients[2]._id, doctor: doctors[2]._id, appointmentDate: nextDay(2), appointmentTime: '10:30', reason: 'Knee pain evaluation', status: 'Scheduled' },
    { patient: patients[3]._id, doctor: doctors[3]._id, appointmentDate: nextDay(3), appointmentTime: '14:00', reason: 'Routine check-up', status: 'Scheduled' },
    { patient: patients[4]._id, doctor: doctors[4]._id, appointmentDate: nextDay(5), appointmentTime: '15:30', reason: 'Child vaccination review', status: 'Scheduled' },
    // past appointments
    { patient: patients[0]._id, doctor: doctors[1]._id, appointmentDate: prevDay(10), appointmentTime: '09:00', reason: 'Headache investigation', status: 'Scheduled' },
    { patient: patients[1]._id, doctor: doctors[0]._id, appointmentDate: prevDay(7), appointmentTime: '10:00', reason: 'ECG review', status: 'Scheduled' },
    { patient: patients[2]._id, doctor: doctors[3]._id, appointmentDate: prevDay(3), appointmentTime: '16:00', reason: 'Fever and cold', status: 'Cancelled' },
  ]);
  console.log(`Seeded ${appointments.length} appointments`);

  console.log('\n✓ Seed complete');
  console.log('Default logins:');
  console.log('  admin@hospital.com        / admin123');
  console.log('  reception@hospital.com    / reception123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

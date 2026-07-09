const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

exports.getDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalPatients, totalDoctors, todayAppointments, upcomingAppointments] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments({
        appointmentDate: { $gte: today, $lt: tomorrow },
        status: 'Scheduled',
      }),
      Appointment.countDocuments({
        appointmentDate: { $gte: tomorrow },
        status: 'Scheduled',
      }),
    ]);

    res.json({ totalPatients, totalDoctors, todayAppointments, upcomingAppointments });
  } catch (err) {
    next(err);
  }
};

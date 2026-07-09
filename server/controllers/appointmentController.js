const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

exports.getAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'fullName patientId')
      .populate('doctor', 'name department')
      .sort({ appointmentDate: 1, appointmentTime: 1 });
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

exports.createAppointment = async (req, res, next) => {
  try {
    const { patient, doctor, appointmentDate, appointmentTime, reason } = req.body;

    if (!patient || !doctor || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const [patientExists, doctorExists] = await Promise.all([
      Patient.findById(patient),
      Doctor.findById(doctor),
    ]);
    if (!patientExists) return res.status(404).json({ message: 'Patient not found' });
    if (!doctorExists) return res.status(404).json({ message: 'Doctor not found' });

    const apptDate = new Date(appointmentDate);
    apptDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (apptDate < today) {
      return res.status(400).json({ message: 'Appointment date cannot be in the past' });
    }

    // Check for double-booking: same doctor, same date, same time slot
    const conflict = await Appointment.findOne({
      doctor,
      appointmentDate: apptDate,
      appointmentTime,
      status: 'Scheduled',
    });
    if (conflict) {
      return res.status(409).json({
        message: `Dr. ${doctorExists.name} already has an appointment at ${appointmentTime} on this date`,
      });
    }

    const appointment = await Appointment.create({
      patient,
      doctor,
      appointmentDate: apptDate,
      appointmentTime,
      reason,
    });

    await appointment.populate('patient', 'fullName patientId');
    await appointment.populate('doctor', 'name department');
    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const { patient, doctor, appointmentDate, appointmentTime, reason } = req.body;
    const apptId = req.params.id;

    const existing = await Appointment.findById(apptId);
    if (!existing) return res.status(404).json({ message: 'Appointment not found' });
    if (existing.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot update a cancelled appointment' });
    }

    const newDate = appointmentDate ? new Date(appointmentDate) : existing.appointmentDate;
    newDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newDate < today) {
      return res.status(400).json({ message: 'Appointment date cannot be in the past' });
    }

    const newTime = appointmentTime || existing.appointmentTime;
    const newDoctor = doctor || existing.doctor.toString();

    // Double-booking check, excluding this appointment itself
    const conflict = await Appointment.findOne({
      _id: { $ne: apptId },
      doctor: newDoctor,
      appointmentDate: newDate,
      appointmentTime: newTime,
      status: 'Scheduled',
    });
    if (conflict) {
      return res.status(409).json({
        message: `That doctor already has an appointment at ${newTime} on this date`,
      });
    }

    const updated = await Appointment.findByIdAndUpdate(
      apptId,
      { patient, doctor: newDoctor, appointmentDate: newDate, appointmentTime: newTime, reason },
      { new: true, runValidators: true }
    )
      .populate('patient', 'fullName patientId')
      .populate('doctor', 'name department');

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.status === 'Cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled' });
    }
    appointment.status = 'Cancelled';
    await appointment.save();
    res.json({ message: 'Appointment cancelled', appointment });
  } catch (err) {
    next(err);
  }
};

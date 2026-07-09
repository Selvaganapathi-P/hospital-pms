const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

exports.getPatients = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const query = search
      ? { fullName: { $regex: search, $options: 'i' } }
      : {};

    const skip = (Number(page) - 1) * Number(limit);
    const [patients, total] = await Promise.all([
      Patient.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Patient.countDocuments(query),
    ]);

    res.json({ patients, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
};

exports.getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    next(err);
  }
};

exports.getPatientAppointments = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [past, upcoming] = await Promise.all([
      Appointment.find({ patient: req.params.id, appointmentDate: { $lt: today } })
        .populate('doctor', 'name department')
        .sort({ appointmentDate: -1 }),
      Appointment.find({ patient: req.params.id, appointmentDate: { $gte: today }, status: 'Scheduled' })
        .populate('doctor', 'name department')
        .sort({ appointmentDate: 1 }),
    ]);

    res.json({ patient, past, upcoming });
  } catch (err) {
    next(err);
  }
};

exports.createPatient = async (req, res, next) => {
  try {
    const { fullName, gender, dob, phone, email, bloodGroup, address } = req.body;

    if (!fullName || !gender || !dob || !phone || !email || !bloodGroup || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const dobDate = new Date(dob);
    if (isNaN(dobDate) || dobDate >= new Date()) {
      return res.status(400).json({ message: 'Date of birth must be a valid past date' });
    }

    const patient = await Patient.create({ fullName, gender, dob: dobDate, phone, email, bloodGroup, address });
    res.status(201).json(patient);
  } catch (err) {
    next(err);
  }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const { fullName, gender, dob, phone, email, bloodGroup, address } = req.body;

    if (dob) {
      const dobDate = new Date(dob);
      if (isNaN(dobDate) || dobDate >= new Date()) {
        return res.status(400).json({ message: 'Date of birth must be a valid past date' });
      }
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { fullName, gender, dob, phone, email, bloodGroup, address },
      { new: true, runValidators: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    next(err);
  }
};

exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    next(err);
  }
};

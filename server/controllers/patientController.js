const Patient = require('../models/Patient');

exports.getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json({ patients, total: patients.length });
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

const Doctor = require('../models/Doctor');

exports.getDoctors = async (req, res, next) => {
  try {
    const { search = '' } = req.query;
    const query = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};
    const doctors = await Doctor.find(query).sort({ name: 1 });
    res.json(doctors);
  } catch (err) {
    next(err);
  }
};

exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    next(err);
  }
};

exports.createDoctor = async (req, res, next) => {
  try {
    const { name, department, qualification, experience, consultationFee, mobile } = req.body;

    if (!name || !department || !qualification || experience == null || consultationFee == null || !mobile) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const doctor = await Doctor.create({ name, department, qualification, experience, consultationFee, mobile });
    res.status(201).json(doctor);
  } catch (err) {
    next(err);
  }
};

exports.updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    next(err);
  }
};

exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: 'Doctor deleted' });
  } catch (err) {
    next(err);
  }
};

const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

exports.globalSearch = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    if (!q.trim()) return res.json({ patients: [], doctors: [] });

    const regex = { $regex: q.trim(), $options: 'i' };

    const [patients, doctors] = await Promise.all([
      Patient.find({ fullName: regex }).limit(10).select('fullName patientId bloodGroup gender'),
      Doctor.find({ name: regex }).limit(10).select('name department qualification'),
    ]);

    res.json({ patients, doctors });
  } catch (err) {
    next(err);
  }
};

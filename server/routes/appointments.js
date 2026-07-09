const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
} = require('../controllers/appointmentController');

router.use(protect);

router.get('/', getAppointments);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', cancelAppointment);

module.exports = router;

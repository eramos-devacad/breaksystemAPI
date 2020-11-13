const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  getUsers,
  getUser,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
} = require('../controllers/auth');
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/User');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

router
  .route('/users')
  .get(protect, authorize('admin'), advancedResults(User), getUsers);
router.route('/users/:id').get(protect, authorize('admin'), getUser);

module.exports = router;

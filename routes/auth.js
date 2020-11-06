const express = require('express');
const { register, login, getMe, getUsers } = require('../controllers/auth');
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/User');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

router
  .route('/users')
  .get(protect, authorize('admin'), advancedResults(User), getUsers);

module.exports = router;

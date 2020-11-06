const express = require('express');
const {
  getBreaks,
  getBreak,
  createBreak,
  updateBreak,
  deleteBreak,
} = require('../controllers/break');

const Break = require('../models/Break');
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const breaktimeRouter = require('./breaktime');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Reroute into other resource router
router.use('/:breakId/breaktime', breaktimeRouter);

router
  .route('/')
  .get(advancedResults(Break), getBreaks)
  .post(protect, authorize('admin'), createBreak);

router
  .route('/:id')
  .get(getBreak)
  .put(protect, authorize('admin'), updateBreak)
  .delete(protect, authorize('admin'), deleteBreak);

module.exports = router;

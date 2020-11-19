const express = require('express');
const {
  getAllBreaktime,
  getBreaktime,
  createBreaktime,
  updateBreaktime,
  deleteBreaktime,
  getAllUserbreaksToday,
  getAllBreaksByLoggedInUser,
} = require('../controllers/breaktime');

const Breaktime = require('../models/Breaktime');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Breaktime, {
      path: 'break',
      select: 'name lengthOfBreak gracePeriod',
    }),
    getAllBreaktime,
  )
  .post(protect, authorize('user'), createBreaktime);

router
  .route('/:id')
  .get(getBreaktime)
  .put(protect, authorize('user'), updateBreaktime)
  .delete(protect, authorize('admin'), deleteBreaktime);

router.route('/me/breaks').get(protect, getAllUserbreaksToday);
router.route('/me/all-breaks').get(protect, getAllBreaksByLoggedInUser);

module.exports = router;

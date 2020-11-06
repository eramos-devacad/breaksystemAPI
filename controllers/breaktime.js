const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

const moment = require('moment');

const Breaktime = require('../models/Breaktime');
const Break = require('../models/Break');
const User = require('../models/User');

//@desc Get User breaktimes
//@route GET /api/v1/breaktime/me/breaks
//@acess Public
exports.getAllUserbreaksToday = asyncHandler(async (req, res, next) => {
  let userTodaysBreak = [];
  const breaktimes = await Breaktime.find({ user: req.user.id });
  const now = moment();
  const today = now.toISOString().split('T')[0];

  breaktimes.map((b) => {
    if (moment(b.createdAt).isSame(today)) {
      userTodaysBreak.push(b);
    }
  });
  console.log(userTodaysBreak, 'breaks today');
  // console.log(today, 'today');

  // const createdAt = breaktimes[0].createdAt;
  // console.log(createdAt, 'createdAt');
  // console.log(moment(today).isSame(createdAt));

  return res.status(200).json({
    success: true,
    count: userTodaysBreak.length,
    data: userTodaysBreak,
  });
});

//@desc Get all breaktime
//@route GET /api/v1/breaktime
//@acess Public
exports.getAllBreaktime = asyncHandler(async (req, res, next) => {
  if (req.params.breakId) {
    const breaktimes = await Breaktime.find({ break: req.params.breakId });

    return res.status(200).json({
      success: true,
      count: breaktimes.length,
      data: breaktimes,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc Get single breaktime
//@route GET /api/v1/breaktime/:id
//@acess Public
exports.getBreaktime = asyncHandler(async (req, res, next) => {
  const breaktime = await Breaktime.findById(req.params.id).populate({
    path: 'break',
    select: 'name times lengthOfBreak gracePeriod',
  });

  if (!breaktime) {
    return next(
      new ErrorResponse(
        `Breaktime not found with the id of ${req.params.id}`,
        404,
      ),
    );
  }

  res.status(200).json({ success: true, data: breaktime });
});

//@desc Create new breaktime
//@route POST /api/v1/breaktime
//@acess Private
exports.createBreaktime = asyncHandler(async (req, res, next) => {
  //Add user to req.body
  req.body.user = req.user.id;

  const breaks = await Break.findById(req.body.break);
  // console.log(breaks, 'date');

  const takenBreak = await Breaktime.find({
    user: req.user.id,
    break: req.body.break,
  });
  // console.log(takenBreak, 'taken break');

  if (takenBreak.length >= breaks.times) {
    return next(
      new ErrorResponse(
        `Not allowed to take more than ${breaks.times} ${breaks.name} break.`,
        403,
      ),
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { currentBreaktime: req.body.break },
    {
      new: true,
      runValidators: true,
    },
  );

  const breaktime = await Breaktime.create(req.body);
  res.status(201).json({
    success: true,
    data: breaktime,
  });
});

//@desc Update breaktime
//@route PUT /api/v1/breaktime/:id
//@acess Private
exports.updateBreaktime = asyncHandler(async (req, res, next) => {
  const endTime = moment();
  req.body.end = endTime;

  let breaktime = await Breaktime.findById(req.params.id);

  if (!breaktime) {
    return next(
      new ErrorResponse(
        `Breaktime not found with the id of ${req.params.id}`,
        404,
      ),
    );
  }

  const expected = breaktime.expected;

  console.log(endTime.toString(), 'endtime');
  console.log(expected.toString(), 'expected');

  if (endTime > expected) {
    req.body.overbreak = true;
  } else {
    req.body.overbreak = false;
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { currentBreaktime: null },
    {
      new: true,
      runValidators: true,
    },
  );

  breaktime = await Breaktime.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: breaktime });
});

//@desc Delete breaktime
//@route DELETE /api/v1/breaktime/:id
//@acess Private
exports.deleteBreaktime = asyncHandler(async (req, res, next) => {
  const breaktime = await Breaktime.findById(req.params.id);
  if (!breaktime) {
    return next(
      new ErrorResponse(
        `Breaktime not found with the id of ${req.params.id}`,
        404,
      ),
    );
  }

  await breaktime.remove();

  res.status(200).json({ success: true, data: {} });
});

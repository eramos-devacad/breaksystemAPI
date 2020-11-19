const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

const moment = require('moment');
const nodemailer = require('nodemailer');

const Breaktime = require('../models/Breaktime');
const Break = require('../models/Break');
const User = require('../models/User');

// email sender credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'eramos.devacad@gmail.com',
    pass: 'ericramos06301994',
  },
});

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

  return res.status(200).json({
    success: true,
    count: userTodaysBreak.length,
    data: userTodaysBreak,
  });
});

//@desc Get User breaktimes
//@route GET /api/v1/breaktime/me/all-breaks
//@acess Public
exports.getAllBreaksByLoggedInUser = asyncHandler(async (req, res, next) => {
  const breaktimes = await Breaktime.find({ user: req.user.id });

  return res.status(200).json({
    success: true,
    count: breaktimes.length,
    data: breaktimes,
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
  const me = await User.findById(req.user.id);
  console.log(me.currentBreaktime, 'user');

  if (me.currentBreaktime) {
    return next(
      new ErrorResponse(`User ${me.fname} is currently on break.`, 403),
    );
  }

  //Add user to req.body
  req.body.user = req.user.id;

  const breaks = await Break.findById(req.body.break);
  console.log(breaks.name, 'break name');
  req.body.breakname = breaks.name;

  const now = moment();
  const today = now.toISOString().split('T')[0];

  const takenBreak = await Breaktime.find({
    user: req.user.id,
    break: req.body.break,
    createdAt: today,
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

  req.body.username = `${me.fname} ${me.lname}`;

  const breaktime = await Breaktime.create(req.body);

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { currentBreaktime: breaktime._id, currentBreakId: breaks._id },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(201).json({
    success: true,
    data: breaktime,
  });
});

//@desc Update breaktime
//@route PUT /api/v1/breaktime/:id
//@acess Private
exports.updateBreaktime = asyncHandler(async (req, res, next) => {
  const me = await User.findById(req.user.id);
  // console.log(me.currentBreaktime, 'user');

  if (!me.currentBreaktime) {
    return next(new ErrorResponse(`User ${me.fname} is not on break.`, 403));
  }

  const endTime = new Date();
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
  const start = breaktime.start;

  if (endTime > expected) {
    req.body.overbreak = true;
    diff = (endTime.getTime() - expected.getTime()) / 1000;
    diff /= 60;
    req.body.minsLate = Math.abs(Math.round(diff));
  } else {
    req.body.overbreak = false;
  }

  breaktime = await Breaktime.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { currentBreaktime: undefined, currentBreakId: undefined },
    {
      new: true,
      runValidators: true,
    },
  );

  if (breaktime.overbreak === true) {
    const dateToday = new Date();

    //Email message option
    const mailOptions = {
      from: 'eramos.devacad@gmail.com',
      to: me.email,
      subject: 'Email from Break System',
      text: `${dateToday.toDateString()} \n You are ${
        breaktime.minsLate
      }mins late on ${breaktime.breakname} break.`,
    };

    //send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email send: ' + info.response);
      }
    });
  }

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

const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Break = require('../models/Break');

//@desc Get all breaks
//@route GET /api/v1/breaks
//@acess Public
exports.getBreaks = asyncHandler(async (req, res, next) => {
  // const breaks = await Break.find();

  res.status(200).json(res.advancedResults);
});

//@desc Get single breaks
//@route GET /api/v1/breaks/:id
//@acess Public
exports.getBreak = asyncHandler(async (req, res, next) => {
  const breaksingle = await Break.findById(req.params.id);

  if (!breaksingle) {
    return next(
      new ErrorResponse(`Break not found with the id of ${req.params.id}`, 404),
    );
  }

  res.status(200).json({ success: true, data: breaksingle });
});

//@desc Create new break
//@route POST /api/v1/breaks
//@acess Private
exports.createBreak = asyncHandler(async (req, res, next) => {
  const newbreak = await Break.create(req.body);
  res.status(201).json({
    success: true,
    data: newbreak,
  });
});

//@desc Update break
//@route PUT /api/v1/breaks/:id
//@acess Private
exports.updateBreak = asyncHandler(async (req, res, next) => {
  let singlebreak = await Break.findById(req.params.id);

  if (!singlebreak) {
    return next(
      new ErrorResponse(`Break not found with the id of ${req.params.id}`, 404),
    );
  }

  singlebreak = await Break.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: singlebreak });
});

//@desc Delete break
//@route DELETE /api/v1/breaks/:id
//@acess Private
exports.deleteBreak = asyncHandler(async (req, res, next) => {
  const singlebreak = await Break.findByIdAndDelete(req.params.id);
  if (!singlebreak) {
    return next(
      new ErrorResponse(
        `Breaktime not found with the id of ${req.params.id}`,
        404,
      ),
    );
  }

  res.status(200).json({ success: true, data: {} });
});

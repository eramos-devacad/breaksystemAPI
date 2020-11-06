const mongoose = require('mongoose');

const BreakSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    unique: true,
    required: [true, 'Please add a name.'],
  },
  lengthOfBreak: {
    type: Number,
    required: [true, 'Please add how long the break is in minutes.'],
  },
  times: {
    type: Number,
    required: [
      true,
      'Please add how many times in a day this break is applicable.',
    ],
  },
  gracePeriod: {
    type: Number,
    required: [true, 'Please add a grace period.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Break', BreakSchema);

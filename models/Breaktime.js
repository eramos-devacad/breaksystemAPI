const mongoose = require('mongoose');
const moment = require('moment');
const Break = require('./Break');
const User = require('./User');

const BreaktimeSchema = new mongoose.Schema({
  start: {
    type: Date,
    // default: Date.now,
  },
  end: Date,
  expected: Date,
  createdAt: String,
  overbreak: Boolean,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  break: {
    type: mongoose.Schema.ObjectId,
    ref: 'Break',
    required: true,
  },
});

//Get start time
BreaktimeSchema.pre('save', async function (next) {
  const now = moment();
  const today = now.toISOString().split('T')[0];
  this.createdAt = today;

  const breaks = await Break.findById(this.break);
  console.log(breaks, 'breaks');

  const allowedMinutes = breaks.lengthOfBreak + breaks.gracePeriod;

  const m = moment();
  this.start = m;

  console.log(m.toString(), 'start');
  this.expected = m.add(allowedMinutes, 'minutes');
  console.log(this.expected.toString(), 'expected');
});

module.exports = mongoose.model('Breaktime', BreaktimeSchema);

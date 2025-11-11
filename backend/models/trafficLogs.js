const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  clientId: String,
  rxBytes: Number,
  txBytes: Number,
  utilization: Number,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TrafficLog', logSchema);
const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  clientType: { type: String, enum: ['pppoe', 'hotspot'], required: true },
  priority: { type: Number, default: 8 },
  timeOfDay: { start: String, end: String },
  baseLimitAt: { type: Number, default: 512 },
  baseMaxLimit: { type: Number, default: 1024 },
  loadThreshold: { type: Number, default: 80 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BandwidthRule', ruleSchema);
const mongoose = require('mongoose')

const featureSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  user: { type: String, required: true },
  bytes_in: { type: Number, default: 0 },
  bytes_out: { type: Number, default: 0 },
  current_limit: { type: String, default: '0/0' },
  router_cpu: { type: Number, default: 0 },
  router_mem: { type: Number, default: 0 },
  sla_tier: { type: Number, min: 1, max: 3, default: 1 },
  hour: { type: Number, min: 0, max: 23 },
  dow: { type: Number, min: 0, max: 6 },
  optimal_mbps: { type: Number },
});

module.exports = mongoose.model('Feature', featureSchema);
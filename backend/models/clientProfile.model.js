const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
  pppoe_name: { type: String, unique: true, required: true },
  sla_tier: { type: Number, min: 1, max: 3, default: 1 },
});

module.export = mongoose.model('ClientProfile', profileSchema);
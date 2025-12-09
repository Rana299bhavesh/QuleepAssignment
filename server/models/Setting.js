const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  modelUrl: { type: String, required: true },
  backgroundColor: { type: String, default: '#ffffff' },
  isWireframe: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', SettingsSchema);

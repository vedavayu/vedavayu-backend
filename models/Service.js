const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  icon: {
    type: String,
    default: 'Pill',
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Service', ServiceSchema);

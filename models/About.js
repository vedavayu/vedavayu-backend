const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  mission: {
    type: String,
    default: ''
  },
  vision: {
    type: String,
    default: ''
  },
  journeyImage: {
    type: String,
    default: ''
  },
  statistics: {
    doctors: {
      type: Number,
      default: 0
    },
    therapies: {
      type: Number,
      default: 0
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('About', AboutSchema);
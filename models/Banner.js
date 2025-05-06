const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  registrationLink: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
const mongoose = require('mongoose');

const StatisticsSchema = new mongoose.Schema({
  patientsTreated: {
    type: Number,
    default: 0
  },
  testReports: {
    type: Number,
    default: 0
  },
  hoursSupport: {
    type: Number,
    default: 0
  },
  recoveryRate: {
    type: Number,
    default: 0
  }
});

// Static method to get statistics
StatisticsSchema.statics.getStatistics = async function() {
  let statistics = await this.findOne();
  
  // If no statistics exist yet, create default ones
  if (!statistics) {
    statistics = new this({
      patientsTreated: 2500,
      testReports: 1200,
      hoursSupport: 24,
      recoveryRate: 98
    });
    await statistics.save();
  }
  
  return statistics;
};

module.exports = mongoose.model('Statistics', StatisticsSchema);
const mongoose = require('mongoose');

const HeatmapBaselineEntrySchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD in IST
    required: true
  },
  count: {
    type: Number,
    required: true,
    default: 0
  },
  platform: {
    type: String,
    enum: ['LeetCode', 'CodeChef', 'Combined'],
    default: 'Combined'
  }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  handles: {
    codeforces: {
      type: String,
      trim: true,
      default: ''
    },
    leetcode: {
      type: String,
      trim: true,
      default: ''
    },
    codechef: {
      type: String,
      trim: true,
      default: ''
    }
  },
  // Stores historical daily counts from LeetCode/CodeChef calendars
  heatmapBaseline: [HeatmapBaselineEntrySchema],
  stats: {
    totalSolved: {
      type: Number,
      default: 0
    },
    codeforcesSolved: {
      type: Number,
      default: 0
    },
    leetcodeSolved: {
      type: Number,
      default: 0
    },
    codechefSolved: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastSyncedAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);

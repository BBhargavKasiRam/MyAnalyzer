const mongoose = require('mongoose');

const SolvedProblemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  platform: {
    type: String,
    enum: ['Codeforces', 'LeetCode', 'CodeChef'],
    required: true
  },
  problemId: {
    type: String,
    required: true // e.g. "CF-1900A", "LC-two-sum", "CC-START100A"
  },
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    default: 'Unrated'
  },
  points: {
    type: Number,
    default: 15
  },
  solvedAt: {
    type: Date,
    required: true // UTC timestamp of first Accepted submission
  },
  dateString: {
    type: String,
    required: true, // Formatted as "YYYY-MM-DD" in IST (Asia/Kolkata)
    index: true
  }
}, {
  timestamps: true
});

// Compound Unique Index: strictly prevents duplicate counting of the same problem
SolvedProblemSchema.index({ userId: 1, platform: 1, problemId: 1 }, { unique: true });

// Secondary index for quick daily lookups per user
SolvedProblemSchema.index({ userId: 1, dateString: 1 });

module.exports = mongoose.model('SolvedProblem', SolvedProblemSchema);

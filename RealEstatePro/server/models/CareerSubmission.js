const mongoose = require('mongoose');

const careerSubmissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  resume_url: {
    type: String,
    trim: true
  },
  cover_letter: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'pending',
    index: true
  },
  submitted_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Add compound index for status and submitted_at
careerSubmissionSchema.index({ status: 1, submitted_at: -1 });

module.exports = mongoose.model('CareerSubmission', careerSubmissionSchema);

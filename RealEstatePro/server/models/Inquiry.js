const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
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
  message: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: 'Website Form'
  },
  received_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
inquirySchema.index({ source: 1 });
inquirySchema.index({ received_at: -1 });

module.exports = mongoose.model('Inquiry', inquirySchema);

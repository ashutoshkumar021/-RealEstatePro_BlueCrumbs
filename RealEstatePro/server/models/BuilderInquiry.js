const mongoose = require('mongoose');

const builderInquirySchema = new mongoose.Schema({
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
  company: {
    type: String,
    trim: true
  },
  message: {
    type: String
  },
  builder_name: {
    type: String,
    trim: true
  },
  project_interested: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'converted', 'not_interested'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
builderInquirySchema.index({ status: 1 });
builderInquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('BuilderInquiry', builderInquirySchema);

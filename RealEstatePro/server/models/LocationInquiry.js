const mongoose = require('mongoose');

const locationInquirySchema = new mongoose.Schema({
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
  location_name: {
    type: String,
    required: true,
    trim: true
  },
  property_type: {
    type: String,
    trim: true
  },
  budget: {
    type: String,
    trim: true
  },
  message: {
    type: String
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
locationInquirySchema.index({ status: 1 });
locationInquirySchema.index({ location_name: 1 });
locationInquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('LocationInquiry', locationInquirySchema);

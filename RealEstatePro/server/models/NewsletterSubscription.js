const mongoose = require('mongoose');

const newsletterSubscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed'],
    default: 'active'
  },
  subscribed_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  unsubscribed_at: {
    type: Date,
    default: null
  },
  ip_address: {
    type: String
  },
  source: {
    type: String,
    default: 'Website'
  }
}, {
  timestamps: true
});

// Add compound index for email and status
newsletterSubscriptionSchema.index({ email: 1, status: 1 });

module.exports = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);

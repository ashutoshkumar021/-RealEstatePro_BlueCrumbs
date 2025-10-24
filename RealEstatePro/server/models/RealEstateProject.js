const mongoose = require('mongoose');

const realEstateProjectSchema = new mongoose.Schema({
  project_name: {
    type: String,
    trim: true
  },
  builder_name: {
    type: String,
    trim: true,
    index: true
  },
  project_type: {
    type: String,
    trim: true
  },
  min_price: {
    type: String,
    trim: true
  },
  max_price: {
    type: String,
    trim: true
  },
  size_sqft: {
    type: String,
    trim: true
  },
  bhk: {
    type: String,
    trim: true,
    index: true
  },
  status_possession: {
    type: String,
    trim: true,
    index: true
  },
  location: {
    type: String,
    trim: true,
    index: true
  }
}, {
  timestamps: true
});

// Add text index for search functionality
realEstateProjectSchema.index({ 
  project_name: 'text', 
  builder_name: 'text', 
  location: 'text' 
});

module.exports = mongoose.model('RealEstateProject', realEstateProjectSchema);

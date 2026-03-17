import mongoose from 'mongoose';

const scanSchema = mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['url', 'email', 'text']
  },
  input: {
    type: String,
    required: true
  },
  riskScore: {
    type: Number,
    required: true
  },
  classification: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High']
  },
  reasons: {
    type: [String],
    default: []
  },
  breakdown: {
    type: Object,
    default: {}
  },
  confidence: {
    type: Number,
    default: 1.0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Scan = mongoose.model('Scan', scanSchema);

export default Scan;

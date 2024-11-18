const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  medications: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: String,
    instructions: String,
    contraindications: [String]
  }],
  diagnosis: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  digitalSignature: {
    doctorSignature: String,
    timestamp: Date
  },
  documentUrl: String,
  metadata: {
    createdAt: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    lastAccessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
  }
}, {
  timestamps: true
});

// Middleware to update lastModified
prescriptionSchema.pre('save', function(next) {
  this.metadata.lastModified = new Date();
  next();
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
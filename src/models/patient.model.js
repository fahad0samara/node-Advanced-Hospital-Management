const mongoose = require('mongoose');
const mongooseEncryption = require('mongoose-encryption');

const patientSchema = new mongoose.Schema({
  mrn: {
    type: String,
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    ssn: { type: String, required: true },
    contact: {
      email: String,
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
      }
    }
  },
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    expiryDate: Date
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    notes: String,
    status: String
  }],
  allergies: [{
    allergen: String,
    severity: String,
    reaction: String
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
  }],
  vitals: [{
    date: { type: Date, default: Date.now },
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    respiratoryRate: Number,
    weight: Number,
    height: Number,
    bmi: Number,
    notes: String,
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }
  }]
}, {
  timestamps: true
});

// Encrypt sensitive fields
const encKey = process.env.ENCRYPTION_KEY;
const sigKey = process.env.SIGNING_KEY;

patientSchema.plugin(mongooseEncryption, {
  encryptionKey: encKey,
  signingKey: sigKey,
  encryptedFields: ['personalInfo.ssn', 'insurance.policyNumber']
});

module.exports = mongoose.model('Patient', patientSchema);
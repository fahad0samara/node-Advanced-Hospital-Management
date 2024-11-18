const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  },
  role: {
    type: String,
    enum: ['superAdmin', 'admin', 'doctor', 'nurse', 'pharmacist', 'labTechnician'],
    required: true
  },
  department: String,
  specialization: String,
  credentials: {
    licenseNumber: String,
    licenseExpiry: Date
  },
  authentication: {
    password: { type: String, required: true },
    twoFactorSecret: String,
    twoFactorEnabled: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  permissions: [{
    module: String,
    actions: [String]
  }],
  schedule: [{
    day: String,
    startTime: String,
    endTime: String
  }]
}, {
  timestamps: true
});

// Password hashing middleware
staffSchema.pre('save', async function(next) {
  if (!this.isModified('authentication.password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.authentication.password = await bcrypt.hash(this.authentication.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password verification method
staffSchema.methods.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.authentication.password);
};

module.exports = mongoose.model('Staff', staffSchema);
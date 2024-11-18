const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate, authorize, verify2FA } = require('../middleware/auth.middleware');
const prescriptionService = require('../services/prescription.service');
const Prescription = require('../models/prescription.model');
const { auditLog } = require('../services/audit.service');

// Validation middleware
const validatePrescription = [
  body('medications').isArray().notEmpty(),
  body('medications.*.name').notEmpty(),
  body('medications.*.dosage').notEmpty(),
  body('medications.*.frequency').notEmpty(),
  body('diagnosis').notEmpty(),
  body('expiryDate').isISO8601()
];

// Create prescription
router.post('/',
  authenticate,
  authorize('doctor'),
  validatePrescription,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const prescription = new Prescription({
        ...req.body,
        doctor: req.user._id
      });

      // Check for drug interactions
      const interactions = await prescriptionService.checkDrugInteractions(req.body.medications);
      if (interactions.length > 0) {
        return res.status(400).json({
          message: 'Potential drug interactions detected',
          interactions
        });
      }

      await prescription.save();
      
      // Generate PDF
      const pdfPath = await prescriptionService.generatePrescriptionPDF(
        prescription,
        req.user,
        await prescription.populate('patient')
      );

      prescription.documentUrl = pdfPath;
      await prescription.save();

      auditLog('prescription_created', req.user._id, 'Prescription', prescription._id);
      
      res.status(201).json(prescription);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Get prescription with 2FA verification
router.get('/:id',
  authenticate,
  verify2FA,
  async (req, res) => {
    try {
      const prescription = await Prescription.findById(req.params.id)
        .populate('patient')
        .populate('doctor');

      if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found' });
      }

      // Access control check
      const canAccess = 
        req.user.role === 'doctor' ||
        req.user.role === 'pharmacist' ||
        prescription.patient._id.toString() === req.user._id.toString();

      if (!canAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      auditLog('prescription_accessed', req.user._id, 'Prescription', prescription._id);
      res.json(prescription);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Send prescription to patient
router.post('/:id/send',
  authenticate,
  authorize('doctor', 'pharmacist'),
  async (req, res) => {
    try {
      const prescription = await Prescription.findById(req.params.id)
        .populate('patient')
        .populate('doctor');

      if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found' });
      }

      await prescriptionService.sendPrescriptionEmail(
        prescription,
        prescription.patient,
        prescription.documentUrl
      );

      res.json({ message: 'Prescription sent successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

module.exports = router;
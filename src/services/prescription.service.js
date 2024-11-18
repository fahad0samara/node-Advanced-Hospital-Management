const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const { auditLog } = require('./audit.service');

class PrescriptionService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async generatePrescriptionPDF(prescription, doctor, patient) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Add hospital letterhead
    page.drawText('Hospital Management System', {
      x: 50,
      y: page.getHeight() - 50,
      size: 20,
      font
    });

    // Add prescription details
    const content = [
      `Date: ${prescription.issueDate.toLocaleDateString()}`,
      `Patient: ${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
      `Doctor: Dr. ${doctor.personalInfo.firstName} ${doctor.personalInfo.lastName}`,
      '\nPrescribed Medications:',
      ...prescription.medications.map(med => 
        `- ${med.name}: ${med.dosage}, ${med.frequency}\n  Instructions: ${med.instructions}`
      )
    ];

    let yPosition = page.getHeight() - 100;
    content.forEach(line => {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 12,
        font
      });
      yPosition -= 20;
    });

    // Add digital signature
    if (prescription.digitalSignature) {
      page.drawText(`Digitally signed by Dr. ${doctor.personalInfo.lastName}`, {
        x: 50,
        y: 100,
        size: 10,
        font
      });
      page.drawText(prescription.digitalSignature.timestamp.toISOString(), {
        x: 50,
        y: 85,
        size: 8,
        font
      });
    }

    const pdfBytes = await pdfDoc.save();
    const fileName = `prescription_${prescription._id}.pdf`;
    const filePath = path.join(__dirname, '../uploads/prescriptions', fileName);
    
    await fs.writeFile(filePath, pdfBytes);
    return filePath;
  }

  async sendPrescriptionEmail(prescription, patient, filePath) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patient.personalInfo.contact.email,
      subject: 'Your Prescription',
      text: 'Please find your prescription attached.',
      attachments: [{
        filename: path.basename(filePath),
        path: filePath
      }]
    };

    await this.transporter.sendMail(mailOptions);
    auditLog('prescription_sent', patient._id, 'Prescription', prescription._id, {
      method: 'email',
      recipient: patient.personalInfo.contact.email
    });
  }

  async checkDrugInteractions(medications) {
    // Simplified drug interaction check
    const interactions = [];
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        // In a real system, this would check against a drug interaction database
        const interaction = await this.queryDrugInteractionDatabase(
          medications[i].name,
          medications[j].name
        );
        if (interaction) {
          interactions.push(interaction);
        }
      }
    }
    return interactions;
  }

  async queryDrugInteractionDatabase(drug1, drug2) {
    // Placeholder for drug interaction database query
    // In a real system, this would connect to a pharmaceutical database
    return null;
  }
}

module.exports = new PrescriptionService();
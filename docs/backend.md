# Backend Documentation

## Project Setup

### Prerequisites
- Node.js v16+
- MongoDB v4.4+
- SMTP server for email notifications
- SSL certificate for HIPAA compliance

### Installation

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

## Architecture Overview

### Directory Structure
```
src/
├── models/          # Mongoose models
├── routes/          # Express routes
├── middleware/      # Custom middleware
├── services/        # Business logic
├── utils/           # Helper functions
├── config/         # Configuration files
├── uploads/        # File storage
└── logs/           # Application logs
```

## Database Schema

### Patient Schema
```javascript
const patientSchema = new mongoose.Schema({
  mrn: { type: String, required: true, unique: true },
  personalInfo: {
    firstName: String,
    lastName: String,
    dob: Date,
    gender: String,
    ssn: String,
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
  // ... other fields
});
```

### Prescription Schema
```javascript
const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    instructions: String
  }],
  // ... other fields
});
```

## API Endpoints

### Authentication
```javascript
/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get token
 * @access Public
 */
router.post('/login', async (req, res) => {
  // Implementation
});

/**
 * @route POST /api/auth/2fa/verify
 * @desc Verify 2FA token
 * @access Private
 */
router.post('/2fa/verify', authenticate, async (req, res) => {
  // Implementation
});
```

### Prescriptions
```javascript
/**
 * @route POST /api/prescriptions
 * @desc Create new prescription
 * @access Private (Doctors only)
 */
router.post('/', 
  authenticate, 
  authorize('doctor'),
  validatePrescription,
  async (req, res) => {
    // Implementation
});
```

## File Handling

### PDF Generation
```javascript
const generatePrescriptionPDF = async (prescription, doctor, patient) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  
  // Add content to PDF
  page.drawText(`Prescription #${prescription._id}`, {
    x: 50,
    y: page.getHeight() - 50,
    size: 20
  });
  
  // Save PDF
  const pdfBytes = await pdfDoc.save();
  const filePath = path.join(__dirname, '../uploads/prescriptions', 
    `${prescription._id}.pdf`);
  
  await fs.writeFile(filePath, pdfBytes);
  return filePath;
};
```

## Security Implementation

### Authentication Middleware
```javascript
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Staff.findById(decoded.id);
    
    if (!user) {
      throw new Error();
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication required' });
  }
};
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', apiLimiter);
```

## Error Handling

### Global Error Handler
```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }

  res.status(500).json({
    message: 'Internal Server Error'
  });
};

app.use(errorHandler);
```

## WebSocket Integration

```javascript
const setupWebSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    // Verify token
    next();
  });

  io.on('connection', (socket) => {
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('prescription_update', (data) => {
      io.to(data.patientId).emit('prescription_updated', data);
    });
  });
};
```

## Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/hospital_management

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=24h

# Encryption
ENCRYPTION_KEY=your_encryption_key
SIGNING_KEY=your_signing_key

# Email
EMAIL_SERVICE=smtp.example.com
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

# Storage
UPLOAD_PATH=/path/to/uploads
BACKUP_PATH=/path/to/backups
```
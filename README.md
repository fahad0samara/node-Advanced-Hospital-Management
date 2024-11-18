# Hospital Management System

A secure, HIPAA-compliant healthcare portal for managing patient records, prescriptions, and medical operations.

## Features

- 🏥 Patient Records Management
- 💊 Electronic Prescriptions
- 📅 Appointment Scheduling
- 🔒 HIPAA Compliance
- 👥 Role-Based Access Control
- 📱 Real-time Updates
- 📊 Analytics Dashboard
- 🔐 Two-Factor Authentication

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- SMTP server access for email notifications

## Backend Setup

### 1. Clone and Install Dependencies

```bash
git clone git remote add origin https://github.com/fahad0samara/node-Advanced-Hospital-Management.git
cd hospital-management-system
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key
SIGNING_KEY=your_signing_key
CLIENT_URL=http://localhost:3000
EMAIL_SERVICE=smtp.example.com
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
BACKUP_PATH=/path/to/backups
```

### 3. Database Setup

```bash
# Start MongoDB service
sudo service mongodb start

# Create database
mongosh
> use hospital_management
```

### 4. Start Backend Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```


## Available Scripts

### Backend

- `npm start`: Start production server
- `npm run dev`: Start development server with hot-reload
- `npm test`: Run test suite

### Frontend

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

## Project Structure

```
├── src/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   ├── uploads/         # File uploads
│   └── logs/            # Application logs
├── client/             # Frontend application
├── tests/              # Test files
└── .env               # Environment variables
```

## API Documentation

### Authentication

```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/2fa/enable
POST /api/auth/2fa/verify
```

### Prescriptions

```
POST /api/prescriptions
GET /api/prescriptions/:id
POST /api/prescriptions/:id/send
```

### Patients

```
GET /api/patients
POST /api/patients
GET /api/patients/:id
PUT /api/patients/:id
```

## Security Features

- JWT Authentication
- Two-Factor Authentication
- Role-Based Access Control
- Data Encryption
- HIPAA Compliance
- Audit Logging
- Rate Limiting

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```
   Solution: Ensure MongoDB service is running:
   sudo service mongodb status
   ```

2. **Email Sending Failed**
   ```
   Solution: Verify SMTP credentials in .env file
   Check firewall settings for SMTP port
   ```

3. **PDF Generation Error**
   ```
   Solution: Ensure write permissions for uploads directory:
   chmod 755 src/uploads
   ```

### Performance Optimization

- Enable MongoDB indexes
- Configure PM2 for production
- Use Redis for caching (optional)
- Enable compression middleware

## Development Guidelines

1. **Code Style**
   - Follow ESLint configuration
   - Use TypeScript for type safety
   - Implement proper error handling

2. **Security**
   - Sanitize user inputs
   - Implement rate limiting
   - Use secure headers
   - Regular dependency updates

3. **Testing**
   - Write unit tests for services
   - Integration tests for APIs
   - End-to-end testing for critical flows




---


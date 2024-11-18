const jwt = require('jsonwebtoken');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const Staff = require('../models/staff.model');

// JWT strategy configuration
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const staff = await Staff.findById(payload.id);
    if (staff) {
      return done(null, staff);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};

// 2FA verification middleware
const verify2FA = async (req, res, next) => {
  const { token } = req.body;
  const staff = req.user;

  if (!staff.authentication.twoFactorEnabled) {
    return next();
  }

  const speakeasy = require('speakeasy');
  const verified = speakeasy.totp.verify({
    secret: staff.authentication.twoFactorSecret,
    encoding: 'base32',
    token: token
  });

  if (!verified) {
    return res.status(401).json({ message: '2FA verification failed' });
  }

  next();
};

module.exports = {
  authenticate: passport.authenticate('jwt', { session: false }),
  authorize,
  verify2FA
};
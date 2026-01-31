const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database
const users = [];
const verificationTokens = new Map();
const resetTokens = new Map();

// Helper functions
const generateToken = (user) => {
  return jwt.sign(
    { UID: user.UID, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { UID: user.UID, email: user.email },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      statusCode: 401,
      errorMessage: 'Authentication token required'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      statusCode: 401,
      errorMessage: 'Invalid or expired token'
    });
  }

  const user = users.find(u => u.UID === decoded.UID);
  if (!user) {
    return res.status(401).json({
      statusCode: 401,
      errorMessage: 'User not found'
    });
  }

  req.user = user;
  next();
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, profile } = req.body;

    // Validation
    if (!email || !password || !profile || !profile.firstName || !profile.lastName) {
      return res.status(400).json({
        statusCode: 400,
        errorMessage: 'Missing required fields'
      });
    }

    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.status(409).json({
        statusCode: 409,
        errorMessage: 'Email already registered'
      });
    }

    // Password validation
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({
        statusCode: 400,
        errorMessage: 'Password must be at least 8 characters with uppercase, lowercase, and digit'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      UID: uuidv4(),
      email,
      password: hashedPassword,
      firstName: profile.firstName,
      lastName: profile.lastName,
      birthDate: profile.birthDate || null,
      phoneNumber: profile.phoneNumber || null,
      isVerified: false,
      registrationDate: new Date().toISOString(),
      lastLoginDate: null
    };

    users.push(user);

    // Generate verification token
    const verificationToken = uuidv4();
    verificationTokens.set(verificationToken, {
      email,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    // In production, send email here
    console.log(`Verification token for ${email}: ${verificationToken}`);

    res.status(201).json({
      statusCode: 201,
      statusMessage: 'Registration successful',
      data: {
        UID: user.UID,
        email: user.email,
        message: 'Please check your email for verification',
        verificationToken: verificationToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      statusCode: 500,
      errorMessage: 'Internal server error'
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { loginID, password } = req.body;

    if (!loginID || !password) {
      return res.status(400).json({
        statusCode: 400,
        errorMessage: 'Email and password are required'
      });
    }

    const user = users.find(u => u.email === loginID);
    if (!user) {
      return res.status(401).json({
        statusCode: 401,
        errorMessage: 'Invalid email or password'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        statusCode: 401,
        errorMessage: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLoginDate = new Date().toISOString();

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      statusCode: 200,
      statusMessage: 'Login successful',
      data: {
        token,
        refreshToken,
        user: {
          UID: user.UID,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      statusCode: 500,
      errorMessage: 'Internal server error'
    });
  }
});

// Verify Email
app.post('/api/auth/verify-email', (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({
        statusCode: 400,
        errorMessage: 'Token and email are required'
      });
    }

    const verificationData = verificationTokens.get(token);
    if (!verificationData || verificationData.email !== email) {
      return res.status(400).json({
        statusCode: 400,
        errorMessage: 'Invalid or expired verification token'
      });
    }

    if (verificationData.expiresAt < Date.now()) {
      verificationTokens.delete(token);
      return res.status(400).json({
        statusCode: 400,
        errorMessage: 'Verification token has expired'
      });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        errorMessage: 'User not found'
      });
    }

    user.isVerified = true;
    user.lastLoginDate = new Date().toISOString();
    verificationTokens.delete(token);

    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      statusCode: 200,
      statusMessage: 'Email verified successfully',
      data: {
        success: true,
        message: 'Email verified successfully',
        token: accessToken,
        refreshToken,
        user: {
          UID: user.UID,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          birthDate: user.birthDate,
          phoneNumber: user.phoneNumber || '',
          isVerified: user.isVerified,
          registrationDate: user.registrationDate,
          lastLoginDate: user.lastLoginDate
        }
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      statusCode: 500,
      errorMessage: 'Internal server error'
    });
  }
});

// Resend Verification
app.post('/api/auth/resend-verification', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        statusCode: 400,
        errorMessage: 'Email is required'
      });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        errorMessage: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        statusCode: 400,
        errorMessage: 'Email already verified'
      });
    }

    const verificationToken = uuidv4();
    verificationTokens.set(verificationToken, {
      email,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    console.log(`New verification token for ${email}: ${verificationToken}`);

    res.json({
      statusCode: 200,
      statusMessage: 'Verification email sent',
      data: { verificationToken }
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      statusCode: 500,
      errorMessage: 'Internal server error'
    });
  }
});

// Request Password Reset
app.post('/api/auth/request-password-reset', (req, res) => {
  try {
    const { email } = req.body;
    
    console.log(`\n📨 Received password reset request for: ${email || 'NO EMAIL'}`);

    if (!email) {
      return res.status(400).json({
        statusCode: 400,
        errorMessage: 'Email is required'
      });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      // Don't reveal if user exists for security
      console.log(`\n⚠️  Password reset requested for ${email} (user not found)`);
      return res.json({
        statusCode: 200,
        statusMessage: 'If the email exists, a reset link has been sent'
      });
    }

    const resetToken = uuidv4();
    resetTokens.set(resetToken, {
      email,
      expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour
    });

    // Build full reset password URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const resetPasswordUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    // Log to console with clickable link
    console.log(`\n📧 Password reset for ${email}:`);
    console.log(`🔗 Reset Link: ${resetPasswordUrl}`);
    console.log(`🔑 Token: ${resetToken}`);
    console.log(`⏰ Expires at: ${new Date(Date.now() + 60 * 60 * 1000).toLocaleString()}\n`);

    res.json({
      statusCode: 200,
      statusMessage: 'Password reset email sent',
      data: {
        success: true,
        message: 'Check your email for reset instructions',
        resetToken: resetToken
      }
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      statusCode: 500,
      errorMessage: 'Internal server error'
    });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        statusCode: 400,
        errorMessage: 'Token and new password are required'
      });
    }

    const resetData = resetTokens.get(token);
    if (!resetData) {
      return res.status(400).json({
        statusCode: 400,
        errorMessage: 'Invalid or expired reset token'
      });
    }

    if (resetData.expiresAt < Date.now()) {
      resetTokens.delete(token);
      return res.status(400).json({
        statusCode: 400,
        errorMessage: 'Reset token has expired'
      });
    }

    const user = users.find(u => u.email === resetData.email);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        errorMessage: 'User not found'
      });
    }

    // Password validation
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return res.status(400).json({
        statusCode: 400,
        errorMessage: 'Password must be at least 8 characters with uppercase, lowercase, and digit'
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    resetTokens.delete(token);

    res.json({
      statusCode: 200,
      statusMessage: 'Password reset successful'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      statusCode: 500,
      errorMessage: 'Internal server error'
    });
  }
});

// Refresh Token
app.post('/api/auth/refresh-token', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        statusCode: 400,
        errorMessage: 'Refresh token is required'
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        statusCode: 401,
        errorMessage: 'Invalid or expired refresh token'
      });
    }

    const user = users.find(u => u.UID === decoded.UID);
    if (!user) {
      return res.status(401).json({
        statusCode: 401,
        errorMessage: 'User not found'
      });
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      statusCode: 200,
      statusMessage: 'Token refreshed',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      statusCode: 500,
      errorMessage: 'Internal server error'
    });
  }
});

// Get Account Info
app.get('/api/user/account-info', authenticateToken, (req, res) => {
  try {
    const user = req.user;
    res.json({
      statusCode: 200,
      statusMessage: 'Account info retrieved',
      data: {
        UID: user.UID,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        registrationDate: user.registrationDate,
        lastLoginDate: user.lastLoginDate
      }
    });
  } catch (error) {
    console.error('Get account info error:', error);
    res.status(500).json({
      statusCode: 500,
      errorMessage: 'Internal server error'
    });
  }
});

// Get Profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const user = req.user;
    res.json({
      statusCode: 200,
      statusMessage: 'Profile retrieved',
      data: {
        UID: user.UID,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        registrationDate: user.registrationDate,
        lastLoginDate: user.lastLoginDate
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      statusCode: 500,
      errorMessage: 'Internal server error'
    });
  }
});

// Update Profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { firstName, lastName, birthDate, phoneNumber } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (birthDate !== undefined) user.birthDate = birthDate || null;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber || null;

    res.json({
      statusCode: 200,
      statusMessage: 'Profile updated successfully',
      data: {
        UID: user.UID,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        registrationDate: user.registrationDate,
        lastLoginDate: user.lastLoginDate
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      statusCode: 500,
      errorMessage: 'Internal server error'
    });
  }
});

// Change Password (for authenticated users)
app.put('/api/user/change-password', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        statusCode: 400,
        errorMessage: 'Current password and new password are required'
      });
    }

    // Find user again to ensure we have the latest password hash
    const userFromDb = users.find(u => u.UID === user.UID);
    if (!userFromDb) {
      return res.status(404).json({
        statusCode: 404,
        errorMessage: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userFromDb.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        statusCode: 401,
        errorMessage: 'Current password is incorrect'
      });
    }

    // Password validation
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return res.status(400).json({
        statusCode: 400,
        errorMessage: 'Password must be at least 8 characters with uppercase, lowercase, and digit'
      });
    }

    // Update password
    userFromDb.password = await bcrypt.hash(newPassword, 10);

    res.json({
      statusCode: 200,
      statusMessage: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      statusCode: 500,
      errorMessage: 'Internal server error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import nodemailer from 'nodemailer';
import { validationResult } from 'express-validator';

const createTransporter = () => nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const sendOtpEmail = async ({ to, subject, title, otp }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
        <h2>${title}</h2>
        <p>Your OTP code is:</p>
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 14px 0;">
          ${otp}
        </div>
        <p>This code expires in 10 minutes.</p>
      </div>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const email = req.body.email.trim().toLowerCase();
    const { password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const otp = generateOtp();
    const user = await User.create({
      email,
      password,
      verificationOtp: hashOtp(otp),
      verificationOtpExpire: Date.now() + 10 * 60 * 1000
    });

    await sendOtpEmail({
      to: user.email,
      subject: 'Verify your EmailTracker account',
      title: 'Verify your email address',
      otp
    });

    res.status(201).json({
      success: true,
      message: 'OTP sent to your email. Please verify your account.',
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select('+verificationOtp');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    const isExpired = !user.verificationOtpExpire || user.verificationOtpExpire < Date.now();
    const isInvalid = user.verificationOtp !== hashOtp(otp);

    if (isExpired || isInvalid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        senderEmail: user.senderEmail
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    const otp = generateOtp();
    user.verificationOtp = hashOtp(otp);
    user.verificationOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendOtpEmail({
      to: user.email,
      subject: 'Verify your EmailTracker account',
      title: 'Verify your email address',
      otp
    });

    res.json({ success: true, message: 'OTP sent again to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isVerified === false) {
      return res.status(403).json({ success: false, message: 'Please verify your email before login' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        senderEmail: user.senderEmail
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const email = req.body.email?.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = generateOtp();

    user.resetPasswordOtp = hashOtp(otp);
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendOtpEmail({
      to: user.email,
      subject: 'EmailTracker password reset OTP',
      title: 'Reset your password',
      otp
    });

    res.json({ success: true, message: 'Password reset OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: 'Email, OTP and password are required' });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+resetPasswordOtp');

    if (!user || user.resetPasswordOtp !== hashOtp(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    user.isVerified = true;

    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successful',
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        senderEmail: user.senderEmail,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { senderEmail, appPasskey } = req.body;

    const user = await User.findById(req.user.id);

    if (senderEmail) {
      const normalizedSenderEmail = senderEmail.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedSenderEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid sender email'
        });
      }
      user.senderEmail = normalizedSenderEmail;
    }
    if (appPasskey) user.appPasskey = appPasskey;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        senderEmail: user.senderEmail
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

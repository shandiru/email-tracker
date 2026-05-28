import express from 'express';
import { body } from 'express-validator';
import {
  register,
  verifyEmail,
  resendVerificationOtp,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

router.post('/verify-email', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Please enter a valid OTP')
], verifyEmail);

router.post('/resend-verification-otp', [
  body('email').isEmail().withMessage('Please enter a valid email')
], resendVerificationOtp);

router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], login);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please enter a valid email')
], forgotPassword);

router.post('/reset-password', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Please enter a valid OTP'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], resetPassword);

router.get('/me', protect, getMe);

router.put('/profile', protect, updateProfile);

export default router;

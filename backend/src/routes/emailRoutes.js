import express from 'express';
import { body } from 'express-validator';
import { sendEmail, getEmails, getEmailById, trackEmail } from '../controllers/emailController.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/send', protect, [
  body('recipientEmail').isEmail().withMessage('Please enter a valid recipient email'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('body').notEmpty().withMessage('Email body is required')
], upload.single('attachment'), sendEmail);

router.get('/', protect, getEmails);

router.get('/:id', protect, getEmailById);

router.get('/track/:trackingId', trackEmail);

export default router;
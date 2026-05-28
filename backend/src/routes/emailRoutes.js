import express from 'express';
import { body } from 'express-validator';
import { sendEmail, getEmails, getEmailById, trackEmail } from '../controllers/emailController.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

const allowedAttachmentTypes = ['application/pdf'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isPdf = allowedAttachmentTypes.includes(file.mimetype);

    if (!isImage && !isPdf) {
      return cb(new Error('Only image and PDF attachments are allowed'));
    }

    cb(null, true);
  }
});

const handleUpload = (req, res, next) => {
  upload.single('attachment')(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Attachment must be 5MB or smaller'
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Invalid attachment'
    });
  });
};

router.post('/send', protect, [
  body('recipientEmail').isEmail().withMessage('Please enter a valid recipient email'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('body').notEmpty().withMessage('Email body is required')
], handleUpload, sendEmail);

router.get('/', protect, getEmails);

router.get('/:id', protect, getEmailById);

router.get('/track/:trackingId', trackEmail);

export default router;

import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientEmail: {
    type: String,
    required: [true, 'Recipient email is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  body: {
    type: String,
    required: [true, 'Email body is required']
  },
  attachment: {
    filename: String,
    path: String,
    contentType: String
  },
  status: {
    type: String,
    enum: ['sent', 'opened'],
    default: 'sent'
  },
  openCount: {
    type: Number,
    default: 0
  },
  openTimestamps: [{
    type: Date
  }],
  sentAt: {
    type: Date,
    default: Date.now
  },
  lastOpenedAt: Date,
  trackingId: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

const Email = mongoose.model('Email', emailSchema);

export default Email;
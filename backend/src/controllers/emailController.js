import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import Email from '../models/Email.js';
import nodemailer from 'nodemailer';

const stripHtml = (value) => {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const sendEmail = async (req, res) => {
  try {
    const recipientEmail = req.body.recipientEmail?.trim().toLowerCase();
    const subject = req.body.subject?.trim();
    const { body } = req.body;
    const attachment = req.file;

    const user = await User.findById(req.user.id).select('+appPasskey');

    if (!user.senderEmail || !user.appPasskey) {
      return res.status(400).json({
        success: false,
        message: 'Please configure your SMTP credentials in your profile first'
      });
    }

    const trackingId = uuidv4();
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const trackingPixel = `<img src="${backendUrl}/api/emails/track/${trackingId}.gif" width="1" height="1" alt="" border="0" style="width:1px;height:1px;border:0;outline:none;text-decoration:none;opacity:0;" />`;

    const htmlBody = body.includes('<html')
      ? body.replace('</body>', `${trackingPixel}</body>`)
      : `<!doctype html><html><body style="margin:0;padding:0;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#111827;">${body}${trackingPixel}</body></html>`;

    const textBody = stripHtml(body);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: user.senderEmail,
        pass: user.appPasskey
      }
    });

    const mailOptions = {
      from: user.senderEmail,
      to: recipientEmail,
      replyTo: user.senderEmail,
      subject,
      text: textBody,
      html: htmlBody,
      headers: {
        'X-Auto-Response-Suppress': 'All'
      }
    };

    if (attachment) {
      mailOptions.attachments = [{
        filename: attachment.originalname,
        content: attachment.buffer,
        contentType: attachment.mimetype
      }];
    }

    await transporter.sendMail(mailOptions);

    const email = await Email.create({
      userId: req.user.id,
      recipientEmail,
      subject,
      body: htmlBody,
      attachment: attachment ? {
        filename: attachment.originalname,
        contentType: attachment.mimetype,
        size: attachment.size
      } : null,
      trackingId,
      sentAt: new Date()
    });

    res.status(201).json({
      success: true,
      email
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmails = async (req, res) => {
  try {
    const { search } = req.query;

    const query = { userId: req.user.id };

    if (search) {
      query.$or = [
        { recipientEmail: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const emails = await Email.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      emails
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmailById = async (req, res) => {
  try {
    const email = await Email.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!email) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    res.json({
      success: true,
      email
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const trackEmail = async (req, res) => {
  try {
    const trackingId = req.params.trackingId.replace(/\.gif$/i, '');

    const email = await Email.findOne({ trackingId });

    if (!email) {
      return res.status(404).send();
    }

    email.status = 'opened';
    email.openCount += 1;
    email.openTimestamps.push(new Date());
    email.lastOpenedAt = new Date();

    await email.save();

    const transparentGif = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    res.set({
      'Content-Type': 'image/gif',
      'Content-Length': transparentGif.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.send(transparentGif);
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).send();
  }
};

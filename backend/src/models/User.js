import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  senderEmail: {
    type: String,
    trim: true,
    default: ''
  },
  appPasskey: {
    type: String,
    select: false,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationOtp: {
    type: String,
    select: false
  },
  verificationOtpExpire: Date,
  resetPasswordOtp: {
    type: String,
    select: false
  },
  resetPasswordExpire: Date
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

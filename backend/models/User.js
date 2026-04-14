const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  age: {
    type: Number,
    min: 0,
    max: 120
  },
  hobbies: {
    type: [String],
    default: []
  },
  bio: {
    type: String
  },
  userId: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Single field index on name
UserSchema.index({ name: 1 });

// Compound index on email and age
UserSchema.index({ email: 1, age: 1 });

// Multikey index on hobbies (handled natively by MongoDB since hobbies is an array, but explicitly creating it for clarity)
UserSchema.index({ hobbies: 1 });

// Text index on bio
UserSchema.index({ bio: 'text' });

// Hashed index on userId
UserSchema.index({ userId: 'hashed' });

// TTL index on createdAt (expires after 5 minutes for testing purposes)
UserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model('User', UserSchema);

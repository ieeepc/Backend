const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  feed_password: { type: String, required: true },
});

adminSchema.pre('save', async function (next) {
  // Hash admin password if it is modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Hash feed password if it is modified
  if (this.isModified('feed_password')) {
    this.feed_password = await bcrypt.hash(this.feed_password, 10);
  }

  next();
});

// Method to compare passwords for login
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to compare feedback password
adminSchema.methods.compareFeedPassword = async function (candidateFeedPassword) {
  return await bcrypt.compare(candidateFeedPassword, this.feed_password);
};

module.exports = mongoose.model('Admin', adminSchema);

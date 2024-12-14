// models/member.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  usn: { type: String, required: true , unique: true},
  year: { type: Number, required: true },
  photo: { type: String },
  linkedin: { type: String },
  github: { type: String },
  post: { type: String },
  password: { type: String, required: true }, 
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;  
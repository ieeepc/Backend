const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  photos: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true }, // Store Cloudinary public_id for deletion
    },
  ],
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

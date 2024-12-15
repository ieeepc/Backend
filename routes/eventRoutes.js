const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Event = require('../models/events');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + file.originalname),
});

const upload = multer({ storage });

router.post('/create', adminAuth, upload.array('photos', 10), async (req, res) => {
  try {
    const uploadedPhotos = await Promise.all(req.files.map(file => cloudinary.uploader.upload(file.path)));
    const photos = uploadedPhotos.map(photo => ({ url: photo.secure_url, public_id: photo.public_id }));
    const event = new Event({ name: req.body.name, date: req.body.date, description: req.body.description, photos });
    await event.save();
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (err) {
    res.status(500).json({ message: 'Error creating event', error: err.message });
  }
});

router.delete('/delete-event/:id',adminAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    await Promise.all(event.photos.map(photo => cloudinary.uploader.destroy(photo.public_id)));
    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting event', error: err.message });
  }
});

router.put('/update-event/:id',adminAuth, upload.array('photos', 10), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (req.files.length > 0) {
      await Promise.all(event.photos.map(photo => cloudinary.uploader.destroy(photo.public_id)));
      const uploadedPhotos = await Promise.all(req.files.map(file => cloudinary.uploader.upload(file.path)));
      event.photos = uploadedPhotos.map(photo => ({ url: photo.secure_url, public_id: photo.public_id }));
    }
    event.name = req.body.name || event.name;
    event.date = req.body.date || event.date;
    event.description = req.body.description || event.description;
    await event.save();
    res.json({ message: 'Event updated successfully', event });
  } catch (err) {
    res.status(500).json({ message: 'Error updating event', error: err.message });
  }
});

router.get('/list-events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 }); // Sort by date
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving events', error: err.message });
  }
});

module.exports = router;

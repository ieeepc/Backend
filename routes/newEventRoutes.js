const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const NewEvent = require('../models/newEvent');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + file.originalname),
});

const upload = multer({ storage });

router.post('/new-event',adminAuth, upload.single('photo'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const newEvent = new NewEvent({ name: req.body.name, date: req.body.date, description: req.body.description, photo: result.secure_url, registerLink: req.body.registerLink ,lastDate: req.body.lastDate});
    await newEvent.save();
    res.status(201).json({ message: 'New event created successfully', newEvent });
  } catch (err) {
    res.status(500).json({ message: 'Error creating event', error: err.message });
  }
});

router.delete('/delete-new-event/:id',adminAuth, async (req, res) => {
  try {
    const event = await NewEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    await cloudinary.uploader.destroy(event.photo);
    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting event', error: err.message });
  }
});

router.put('/update-new-event/:id',adminAuth, upload.single('photo'), async (req, res) => {
  try {
    const event = await NewEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (req.file) {
      await cloudinary.uploader.destroy(event.photo);
      const result = await cloudinary.uploader.upload(req.file.path);
      event.photo = result.secure_url;
    }
    event.name = req.body.name || event.name;
    event.date = req.body.date || event.date;
    event.description = req.body.description || event.description;
    event.registerLink = req.body.registerLink || event.registerLink;
    event.lastDate = req.body.lastDate || event.lastDate;
    await event.save();
    res.json({ message: 'Event updated successfully', event });
  } catch (err) {
    res.status(500).json({ message: 'Error updating event', error: err.message });
  }
});

router.get('/list-new-events', async (req, res) => {
  try {
    const events = await NewEvent.find().sort({ date: 1 }); // Sort by date
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving events', error: err.message });
  }
});

module.exports = router;

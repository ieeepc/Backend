// routes/feedbackRoutes.js
const express = require('express');
const Feedback = require('../models/feedback');
const adminAuth = require('../middleware/adminAuth');
 
const router = express.Router();

// Submit feedback
router.post('/submit', async (req, res) => {
  try {
    const { feedback,submittedBy } = req.body;

    if (!feedback || !submittedBy) {
      return res.status(400).json({ message: 'Feedback and user identity are required' });
    }

    const newFeedback = new Feedback({ feedback, submittedBy });
    await newFeedback.save();

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting feedback', error: err.message });
  }
});

router.get('/all', adminAuth, async (req, res) => {
    try {
      const feedbackList = await Feedback.find().select('-submittedBy').sort({ createdAt: -1 });
      res.json(feedbackList);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error retrieving feedback', error: err.message });
    }
  });

  module.exports = router;
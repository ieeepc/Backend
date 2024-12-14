const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const memberRoutes = require('./routes/memberRoutes');
const eventRoutes = require('./routes/eventRoutes');
const neweventRoutes = require('./routes/newEventRoutes');
const adminAuthRoutes = require('./routes/adminAuth'); 
const memberFeedbackRoutes = require('./routes/feedbackRoutes'); 

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Admin Authentication Middleware
const adminAuth = require('./middleware/adminAuth'); 

app.get('/',(req,res)=>{
  res.send("Express app is Running ");
})

app.use('/api/admin', adminAuthRoutes); 
app.use('/api/events',  eventRoutes);
app.use('/api/feedback', memberFeedbackRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/newevent', neweventRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

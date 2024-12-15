// routes/memberRoutes.js
const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloudinary");
const Member = require("../models/member");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Route to create a new member
router.post("/add-member",adminAuth,upload.single("photo"),async (req, res) => {
    try {
      let photoUrl = "";
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        photoUrl = result.secure_url;
      }
      // Hash password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const normalizedUsn = req.body.usn.toLowerCase();
      // Save member data in MongoDB
      const member = new Member({
        name: req.body.name,
        usn: normalizedUsn,
        year: req.body.year,
        photo: photoUrl,
        linkedin: req.body.linkedin,
        github: req.body.github,
        post: req.body.post,
        password: hashedPassword,
      });

      await member.save();
      res.status(201).json({ message: "Member created successfully!" });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: "Error adding member" });
    }
  }
);

// Route to update a member's photo or details
router.put("/update-member/:id", upload.single("photo"), async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // If new photo is uploaded, upload it to Cloudinary and delete old photo from Cloudinary
    if (req.file && member.photo) {
      console.log("New photo uploaded:", req.file); // Debugging the uploaded file
      await cloudinary.uploader.destroy(member.photo); // Delete old image
      const result = await cloudinary.uploader.upload(req.file.path);
      member.photo = result.secure_url;
    }
    else if(req.file)
    {
      const result = await cloudinary.uploader.upload(req.file.path);
      member.photo = result.secure_url;
    }
    const normalizedUsn = req.body.usn.toLowerCase();
    // Update member fields
    member.name = req.body.name || member.name;
    member.usn = normalizedUsn || member.usn;
    member.year = req.body.year || member.year;
    member.linkedin = req.body.linkedin || member.linkedin;
    member.github = req.body.github || member.github;
    member.post = req.body.post || member.post;

    // Save updated member
    await member.save();

    res.json({ message: "Member Details updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating member" });
  }
});

// Route to delete a member
router.delete("/delete-member/:id", adminAuth, async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if(member.photo)
      await cloudinary.uploader.destroy(member.photo); 
    res.json({ message: "Member deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting member" });
  }
});

router.get("/members-by-year/:year", async (req, res) => {
  try {
    const year = req.params.year; // Get the year parameter from the URL
    const members = await Member.find({ year: year }); // Find members by year

    if (members.length === 0) {
      return res
        .status(404)
        .json({ message: `No members found for year ${year}` });
    }

    res.json(members); // Return the list of members
  } catch (err) {
    res.status(500).json({ message: "Error retrieving members" });
  }
});

//member login
router.post("/login", async (req, res) => {
  const { usn, password } = req.body; // Extract USN and password from request body

  try {
    // Find member by usn
    const member = await Member.findOne({ usn });

    // If member not found
    if (!member) {
      return res.status(400).json({ message: "Member does not Exists" });
    }

    // Compare the provided password with the hashed password stored in DB
    const isPasswordCorrect = await bcrypt.compare(password, member.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    // If login is successful, return the member's ID
    res.json({ memberId: member._id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/mydetails/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the member by _id
    const member = await Member.findById(id).select('-password'); // Exclude the password from the response

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.status(200).json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching member details', error: err.message });
  }
});


module.exports = router;

const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all banners
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new banner (Admin only)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json(banner);
  } catch (err) {
    res.status(400).json({ message: 'Invalid banner data' });
  }
});

// Update banner (Admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json(banner);
  } catch (err) {
    res.status(400).json({ message: 'Invalid update data' });
  }
});

// Delete banner (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json({ message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
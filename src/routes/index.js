const express = require('express');
const router = express.Router();

// Homepage route
router.get('/', (req, res) => {
  res.send('Welcome to the homepage!');
});

// API status route
router.get('/status', (req, res) => {
  res.json({ status: 'API is up and running' });
});

module.exports = router;


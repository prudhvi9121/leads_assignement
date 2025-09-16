// routes/results.js
const express = require('express');
const { getResults, getResultsCsv } = require('../controllers/results');

const router = express.Router();

// Results as JSON list
router.get('/', getResults);
// Results as CSV file
router.get('/export', getResultsCsv);

module.exports = router;



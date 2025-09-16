// routes/results.js
const express = require('express');
const { getResults, getResultsCsv } = require('../controllers/results');

const router = express.Router();

router.get('/', getResults);
router.get('/export', getResultsCsv);

module.exports = router;



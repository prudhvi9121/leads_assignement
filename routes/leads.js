// routes/leads.js
const express = require('express');
const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

let leadsStore = [];

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "CSV file required" });

  const leads = [];
  const parser = fs.createReadStream(req.file.path).pipe(csv.parse({ columns: true, trim: true }));

  parser.on('data', row => leads.push(row));
  parser.on('end', () => {
    fs.unlinkSync(req.file.path); // remove temp file
    leadsStore = leads;
    res.json({ message: "Leads uploaded", count: leads.length });
  });
  parser.on('error', err => res.status(500).json({ error: err.message }));
});

router.get('/all', (req, res) => res.json(leadsStore));

router._getLeads = () => leadsStore;
module.exports = router;

// routes/leads.js
const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');


const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });
const LEADS_FILE = path.join(__dirname, '..', 'data', 'leads.json');
fs.mkdirSync(path.dirname(LEADS_FILE), { recursive: true });


// POST /leads/upload
router.post('/upload', upload.single('file'), async (req, res) => {
if (!req.file) return res.status(400).json({ error: 'CSV file required under field name "file"' });


const leads = [];
const filepath = req.file.path;


fs.createReadStream(filepath)
.pipe(csv())
.on('data', (row) => {
// normalize keys: name, role, company, industry, location, linkedin_bio
leads.push({
name: row.name || row.Name || '',
role: row.role || row.Role || '',
company: row.company || row.Company || '',
industry: row.industry || row.Industry || '',
location: row.location || row.Location || '',
linkedin_bio: row.linkedin_bio || row.linkedin || row.bio || ''
});
})
.on('end', () => {
fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
// remove uploaded CSV
fs.unlinkSync(filepath);
res.json({ ok: true, count: leads.length });
})
.on('error', (err) => res.status(500).json({ error: err.message }));
});


// GET /leads (debug)
router.get('/', (req, res) => {
if (!fs.existsSync(LEADS_FILE)) return res.json([]);
const leads = JSON.parse(fs.readFileSync(LEADS_FILE));
res.json(leads);
});


module.exports = router;
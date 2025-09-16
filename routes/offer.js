// routes/offer.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');


const STORE_FILE = path.join(__dirname, '..', 'data', 'offer.json');
fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });


// POST /offer
router.post('/', (req, res) => {
const { name, value_props, ideal_use_cases } = req.body;
if (!name || !ideal_use_cases) return res.status(400).json({ error: 'name and ideal_use_cases required' });


const offer = { name, value_props: value_props || [], ideal_use_cases };
fs.writeFileSync(STORE_FILE, JSON.stringify(offer, null, 2));
res.json({ ok: true, offer });
});


// GET /offer (for debugging)
router.get('/', (req, res) => {
if (!fs.existsSync(STORE_FILE)) return res.status(404).json({ error: 'no offer uploaded' });
const offer = JSON.parse(fs.readFileSync(STORE_FILE));
res.json(offer);
});


module.exports = router;
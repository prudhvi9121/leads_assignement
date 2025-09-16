// index.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const offerRoute = require('./routes/offer');
const leadsRoute = require('./routes/leads');
const app = express();
app.use(bodyParser.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

app.use('/offer', offerRoute);
app.use('/leads', leadsRoute);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

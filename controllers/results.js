// controllers/results.js
const { ruleScore } = require("../services/scoring");
const { aiScore } = require("../services/aiscoring");
const offerRoute = require("../routes/offer");
const leadsRoute = require("../routes/leads");

async function getResults(req, res) {
  const offer = offerRoute.currentOffer();
  const leads = leadsRoute._getLeads();

  if (!offer) return res.status(400).json({ error: "No offer defined" });
  if (!leads || leads.length === 0) return res.status(400).json({ error: "No leads uploaded" });

  const results = [];
  for (const lead of leads) {
    const rScore = ruleScore({ lead, offer });
    const aScore = await aiScore({ lead, offer });
    const aiPoints = typeof aScore === 'number' ? aScore : (aScore?.points || 0);

    let intent = (typeof aScore === 'object' && aScore?.intent) ? aScore.intent : 'Medium';
    let reasoning = (typeof aScore === 'object' && aScore?.reasoning) ? String(aScore.reasoning) : '';
    // Strip code fences if present
    if (reasoning.startsWith('```')) {
      reasoning = reasoning.replace(/^```[a-zA-Z]*\n?/,'').replace(/```$/,'').trim();
    }
    // Try to parse JSON reasoning payloads
    try {
      const parsed = JSON.parse(reasoning);
      if (parsed && typeof parsed === 'object') {
        intent = parsed.intent || intent;
        reasoning = parsed.reasoning || reasoning;
      }
    } catch (_) {}

    results.push({
      name: lead.name,
      role: lead.role,
      company: lead.company,
      intent,
      score: rScore + aiPoints,
      reasoning
    });
  }

  res.json(results);
}

async function getResultsCsv(req, res) {
  const offer = offerRoute.currentOffer();
  const leads = leadsRoute._getLeads();

  if (!offer) return res.status(400).json({ error: "No offer defined" });
  if (!leads || leads.length === 0) return res.status(400).json({ error: "No leads uploaded" });

  const rows = [];
  for (const lead of leads) {
    const rScore = ruleScore({ lead, offer });
    const aScore = await aiScore({ lead, offer });
    const aiPoints = typeof aScore === 'number' ? aScore : (aScore?.points || 0);

    let intent = (typeof aScore === 'object' && aScore?.intent) ? aScore.intent : 'Medium';
    let reasoning = (typeof aScore === 'object' && aScore?.reasoning) ? String(aScore.reasoning) : '';
    if (reasoning.startsWith('```')) {
      reasoning = reasoning.replace(/^```[a-zA-Z]*\n?/,'').replace(/```$/,'').trim();
    }
    try {
      const parsed = JSON.parse(reasoning);
      if (parsed && typeof parsed === 'object') {
        intent = parsed.intent || intent;
        reasoning = parsed.reasoning || reasoning;
      }
    } catch (_) {}

    rows.push({
      name: lead.name,
      role: lead.role,
      company: lead.company,
      intent,
      score: rScore + aiPoints,
      reasoning
    });
  }

  try {
    const { Parser } = require('json2csv');
    const parser = new Parser({ fields: ['name','role','company','intent','score','reasoning'] });
    const csv = parser.parse(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="results.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to generate CSV' });
  }
}

module.exports = { getResults, getResultsCsv };

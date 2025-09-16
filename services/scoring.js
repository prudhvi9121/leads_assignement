// services/scoring.js
// Rule-based score: seniority, ICP match, completeness. Max 50.

function ruleScore({ lead, offer }) {
    let score = 0;
    const role = (lead.role || '').toLowerCase();
  
    // Role relevance
    if (role.includes("head") || role.includes("director") || role.includes("vp") || role.includes("chief")) {
      score += 20; // decision maker
    } else if (role.includes("lead") || role.includes("senior")) {
      score += 10; // influencer
    }
  
    // Industry match
    const leadIndustry = (lead.industry || '').toLowerCase();
    const icp = (offer.ideal_use_cases || []).map(x => x.toLowerCase());
    const exactMatch = icp.some(i => leadIndustry.includes(i));
    if (exactMatch) score += 20;
    else {
      const adjacentMatch = icp.some(i => {
        const tokens = i.split(/\s+/);
        return tokens.some(t => leadIndustry.includes(t));
      });
      if (adjacentMatch) score += 10;
    }
  
    // Data completeness
    const fields = ['name', 'role', 'company', 'industry', 'location', 'linkedin_bio'];
    const allPresent = fields.every(f => lead[f] && lead[f].trim() !== "");
    if (allPresent) score += 10;
  
    return score;
  }
  
  module.exports = { ruleScore };
  
const { ruleScore } = require("../services/scoring");

describe("Rule Scoring Logic", () => {
  const offer = {
    name: "AI Outreach Automation",
    value_props: ["24/7 outreach", "6x meetings"],
    ideal_use_cases: ["B2B SaaS mid-market"]
  };

  it("should score decision maker in exact industry high", () => {
    const lead = {
      name: "Ava Patel",
      role: "Head of Growth",
      company: "FlowMetrics",
      industry: "B2B SaaS mid-market",
      location: "Bengaluru",
      linkedin_bio: "Scaling SaaS growth"
    };

    const score = ruleScore({ lead, offer });
    expect(score).toBeGreaterThanOrEqual(40);
  });

  it("should score unrelated role and industry low", () => {
    const lead = {
      name: "Rohit Sharma",
      role: "Intern",
      company: "TechSolutions",
      industry: "Healthcare",
      location: "Mumbai",
      linkedin_bio: ""
    };

    const score = ruleScore({ lead, offer });
    expect(score).toBeLessThanOrEqual(10);
  });
});

const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const offerRoutes = require("../routes/offer");
const leadsRoutes = require("../routes/leads");
const { getResults } = require("../controllers/results");

const app = express();
app.use(bodyParser.json());
app.use("/offer", offerRoutes);
app.use("/leads", leadsRoutes);
app.get("/results", getResults);

describe("Lead Scoring API", () => {
  it("should upload offer, leads, and return scored results", async () => {
    // Step 1: Post an offer
    await request(app)
      .post("/offer")
      .send({
        name: "AI Outreach Automation",
        value_props: ["24/7 outreach", "6x meetings"],
        ideal_use_cases: ["B2B SaaS mid-market"]
      })
      .expect(200);

    // Step 2: Upload CSV
    await request(app)
      .post("/leads/upload")
      .attach("file", "tests/sample.csv")
      .expect(200);

    // Step 3: Get results
    const res = await request(app).get("/results").expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);

    // Check scoring
    const firstLead = res.body.data[0];
    expect(firstLead.total_score).toBeGreaterThanOrEqual(30);
  });
});

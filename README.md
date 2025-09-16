# Leads Assignment API

A small Node.js/Express service to upload leads (CSV), define an offer, score leads with rules + AI, fetch results, and export CSV.

## Setup

1) Requirements
- Node 18+

2) Install
```bash
npm install
```

3) Env
Create a `.env` file:
```bash
PORT=3000
GEMINI_API_KEY=your_key_here   # optional, returns fallback if missing
GEMINI_MODEL=gemini-1.5-flash  # optional
```

4) Run
```bash
npm run dev   # with nodemon
# or
npm start
```

Health check: `GET /health` → `{ "status": "ok" }`

## API

- POST `/offer`
```bash
curl -X POST http://localhost:3000/offer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Outreach Automation",
    "value_props": ["24/7 outreach", "6x meetings"],
    "ideal_use_cases": ["B2B SaaS mid-market"]
  }'
```

- POST `/leads/upload` (multipart CSV)
```bash
curl -X POST http://localhost:3000/leads/upload \
  -F "file=@tests/sample.csv"
```

- GET `/results` (JSON list)
```bash
curl http://localhost:3000/results
```
Returns like:
```json
[
  {
    "name": "Ava Patel",
    "role": "Head of Growth",
    "company": "FlowMetrics",
    "intent": "High",
    "score": 85,
    "reasoning": "Fits ICP SaaS mid-market and role is decision maker."
  }
]
```

- GET `/results/export` (CSV download)
```bash
curl -L -o results.csv http://localhost:3000/results/export
```

## Rule Logic
Defined in `services/scoring.js`:
- Role seniority → up to +20
- Industry vs ICP exact/adjacent match → up to +20
- Data completeness → +10
Total rule score is added to AI score to form `score`.

## AI Scoring
Defined in `services/aiscoring.js`:
- If `GEMINI_API_KEY` missing, returns fallback `{ intent: Medium, points: 30 }`.
- Otherwise calls Gemini `generateContent` with a prompt built from Offer + Lead.
- Parses intent from response text and maps to points: High 50, Medium 30, Low 10.
- Test mode short-circuits to avoid network delays.

## Deployment

### Render (example)
- Add repo on Render as a Web Service.
- Runtime: Node
- Build: `npm install`
- Start: `npm start`
- Add env vars from `.env`.

Alternatively, use the provided `render.yaml` and connect repo.

### Railway / Heroku / Vercel
- Railway/Heroku: set Start Command to `npm start` and add env vars.
- Vercel: Use Node Serverless or Vercel Functions with an adapter (not included here).

## Live URL
When deployed, update this section with your base URL:
- Base URL: https://leads-assignement.onrender.com/

## Development Notes
- Results shape is a simplified list for easy CSV export.
- CSV parser expects headers: name, role, company, industry, location, linkedin_bio.
- Tests: `npm test`

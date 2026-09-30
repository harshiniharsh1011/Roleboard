# 🌅 Roleboard — every job board, one search

React + Tailwind frontend, Flask backend. No AI/ML, no LLM, no paid APIs.
A warm, glassmorphic UI with a floating search across every job board
that actually lets you search it.

## ⚠️ Read this first: the scraping reality

Most of the well-known portals — **Naukri, Indeed, LinkedIn, Glassdoor,
Foundit, Wellfound, ZipRecruiter** — prohibit automated scraping in their
Terms of Service and/or run active anti-bot protection. This project
follows the rule "don't bypass CAPTCHA, auth, anti-bot, or robots
restrictions," so those seven are still real, selectable portals in the
UI, but each is honestly marked as restricted and returns zero results
with a clear note instead of faking data or silently breaking a site's
access controls.

| Portal | Status |
|---|---|
| WeWorkRemotely | ✅ Real scraper — public category pages |
| Internshala | ✅ Real scraper — public job search pages |
| Himalayas | ✅ Real scraper — public `/jobs` pages |
| RemoteOK | ✅ Real scraper — public HTML board (not `/api`, stays API-free) |
| Work at a Startup (YC) | ✅ Real scraper — public listings |
| Naukri / Indeed / LinkedIn / Glassdoor / Foundit / Wellfound / ZipRecruiter | 🚫 Restricted — shown in the UI, returns an honest notice |

Swapping a restricted portal for a permitted source (an official
employer/partner feed, a portal's own RSS, licensed job data, LinkedIn's
official Talent API) is a one-line change in `backend/scrapers/` — see
"Extending" below.

## ✨ Features

- **One search, many boards** — role, experience, location, skills, and a
  portal picker that shows all 12 portals with an honest live/restricted
  indicator dot, not hidden behind extra clicks.
- **Saved jobs** — bookmark any listing; persists in your browser
  (localStorage) and has its own filtered view via the nav rail.
- **Applied tracking** — clicking "Apply" opens the original listing and
  marks it ✓ Applied here, so you can track what you've already gone after.
- **Recent searches** — one-click re-run of your last 5 searches.
- **Per-source result counts & filter chips**, relevance/latest/location/
  experience sorting — all plain keyword logic, no ML.
- **Copy-link** on every job card.
- **Loading skeletons** instead of a blank screen while sources are queried.
- Clear, friendly error states: empty role, no portal selected, no results,
  source blocked/unavailable, missing fields, invalid job URL.

## Project structure

```
roleboard/
├── backend/
│   ├── app.py                 # Flask API: /api/portals, /api/search
│   ├── scrapers/
│   │   ├── base.py            # common connector interface
│   │   ├── _http.py           # shared browser-like request headers
│   │   ├── weworkremotely.py  # real scraper
│   │   ├── internshala.py     # real scraper
│   │   ├── himalayas.py       # real scraper
│   │   ├── remoteok.py        # real scraper
│   │   ├── workatastartup.py  # real scraper
│   │   └── restricted.py      # honest stubs for ToS-restricted portals
│   ├── utils/normalize.py     # job schema + relevance scoring/filtering
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── hooks/usePersistentState.js
    │   └── components/         # SearchCard, PortalSelector, JobCard,
    │                            # JobModal, FilterBar, SourceNotes, icons
    ├── index.html
    ├── tailwind.config.js
    └── package.json
```

## Run it

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py          # http://localhost:5000
```

**Frontend** (separate terminal)
```bash
cd frontend
npm install
npm run dev             # http://localhost:5173, proxies /api to :5000
```

## Notes on the scrapers

- Each real scraper sends realistic browser headers (`scrapers/_http.py`)
  and has fallback CSS selectors, but I couldn't test any of them against
  the live sites from my sandbox (no network access to those domains) —
  so a selector may need a small tweak once you run it for real. If a
  source returns nothing or an HTTP error, open dev tools on that site,
  grab the HTML around a job listing, and I can fix the selector fast.
- Please keep request frequency reasonable — this is a personal tool, not
  a crawler; hammering a site is how IPs get blocked for everyone.

## Extending

To add a new permitted source: create `scrapers/yourportal.py`
implementing `BaseConnector.search()`, returning job dicts matching
`utils/normalize.py`'s schema, then register it in `scrapers/__init__.py`.
The frontend needs no changes — it renders whatever the registry returns.

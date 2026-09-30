"""
Common job schema + helpers used by every scraper/connector.

Every source module must return a list of dicts shaped like JOB_SCHEMA,
regardless of how differently the source portal structures its own data.
This is what lets the frontend render every portal identically.
"""

from datetime import datetime
import re

JOB_SCHEMA_FIELDS = [
    "title", "company", "source", "location", "experience", "salary",
    "skills", "work_mode", "employment_type", "posted_date",
    "description", "requirements", "url",
]


def make_job(**kwargs):
    """Build a job dict with every schema field present (None/[] if unknown)."""
    job = {field: None for field in JOB_SCHEMA_FIELDS}
    job["skills"] = []
    job["requirements"] = []
    job.update(kwargs)
    return job


def score_job(job, role, skills_wanted, location_wanted, experience_wanted):
    """
    Very simple, transparent relevance scorer (no ML/AI):
    counts keyword overlaps between what the user typed and the job fields.
    Returns an integer score; higher = more relevant.
    """
    score = 0
    haystack_title = (job.get("title") or "").lower()
    haystack_desc = (job.get("description") or "").lower()
    haystack_skills = " ".join(job.get("skills") or []).lower()

    if role:
        role_tokens = [t for t in re.split(r"\W+", role.lower()) if t]
        for t in role_tokens:
            if t in haystack_title:
                score += 5
            elif t in haystack_desc:
                score += 1

    if skills_wanted:
        wanted_tokens = [t.strip().lower() for t in re.split(r"[,\n]", skills_wanted) if t.strip()]
        for t in wanted_tokens:
            if t in haystack_skills:
                score += 4
            elif t in haystack_desc:
                score += 1

    if location_wanted:
        loc = location_wanted.strip().lower()
        job_loc = (job.get("location") or "").lower()
        if loc and loc in job_loc:
            score += 3
        elif "remote" in job_loc and "remote" in loc:
            score += 3

    if experience_wanted and experience_wanted.lower() != "any":
        job_exp = (job.get("experience") or "").lower()
        if experience_wanted.lower() in job_exp:
            score += 2

    return score


def filter_and_rank(jobs, role, experience, location, skills, sort_by="relevance"):
    scored = []
    for job in jobs:
        s = score_job(job, role, skills, location, experience)
        scored.append((s, job))

    # Keep everything (don't hard-filter to zero results on strict matches);
    # relevance sort does the heavy lifting. Only drop obvious non-matches
    # when the user gave a location AND the job clearly states a different,
    # non-remote one.
    if location:
        loc = location.strip().lower()
        scored = [
            (s, j) for (s, j) in scored
            if not j.get("location")
            or loc in j["location"].lower()
            or "remote" in j["location"].lower()
            or s > 0
        ]

    if sort_by == "relevance":
        scored.sort(key=lambda pair: pair[0], reverse=True)
    elif sort_by == "latest":
        def parse_date(j):
            d = j.get("posted_date") or ""
            try:
                return datetime.fromisoformat(d)
            except Exception:
                return datetime.min
        scored.sort(key=lambda pair: parse_date(pair[1]), reverse=True)
    elif sort_by == "location":
        scored.sort(key=lambda pair: (pair[1].get("location") or "").lower())
    elif sort_by == "experience":
        scored.sort(key=lambda pair: (pair[1].get("experience") or "").lower())

    return [j for (_, j) in scored]

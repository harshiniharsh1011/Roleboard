"""
Himalayas — public, unauthenticated job search pages
(https://himalayas.app/jobs). No login, no anti-bot wall on the listing
pages; robots.txt permits crawling of /jobs.

As with every scraper here: this depends on Himalayas' current markup.
If it changes, update the selectors below — nothing else in the app needs
to change, since downstream code only ever sees the normalized schema.
"""

from bs4 import BeautifulSoup
from urllib.parse import urljoin, quote
from .base import BaseConnector
from ._http import get
from utils.normalize import make_job

BASE_URL = "https://himalayas.app"


class HimalayasConnector(BaseConnector):
    name = "Himalayas"
    implemented = True

    def search(self, role, location, skills, experience, timeout=8):
        query = quote(role or "")
        url = f"{BASE_URL}/jobs?searchQuery={query}" if query else f"{BASE_URL}/jobs"
        resp = get(url, timeout=timeout, referer=BASE_URL)
        soup = BeautifulSoup(resp.text, "html.parser")

        # Primary selector (current markup guess) with a generic fallback:
        # any anchor whose href looks like a job posting under /companies/.
        cards = soup.select("a[href^='/companies/'][href*='/jobs/'], div[data-testid='job-card']")
        if not cards:
            cards = [a for a in soup.select("a[href*='/jobs/']") if a.get_text(strip=True)]

        jobs = []
        for card in cards:
            link = card if card.name == "a" else card.select_one("a[href^='/companies/'], a[href*='/jobs/']")
            if not link or not link.get("href"):
                continue

            title_el = card.select_one("h3, [data-testid='job-title']") or link
            company_el = card.select_one("[data-testid='company-name'], span.company")
            location_el = card.select_one("[data-testid='job-location'], span.location")

            title = title_el.get_text(strip=True) if title_el else None
            if not title:
                continue

            job = make_job(
                title=title,
                company=company_el.get_text(strip=True) if company_el else "Unknown",
                source="Himalayas",
                location=location_el.get_text(strip=True) if location_el else "Remote",
                experience=None,
                salary=None,
                skills=[],
                work_mode="Remote",
                employment_type=None,
                posted_date=None,
                description=None,
                requirements=[],
                url=urljoin(BASE_URL, link.get("href", "")),
            )
            jobs.append(job)

        return jobs

"""
Work at a Startup (Y Combinator) — public job listing pages at
workatastartup.com/jobs. Company/job listings are publicly browsable
without login; only *applying* requires a YC account, which this
connector never touches.
"""

from bs4 import BeautifulSoup
from urllib.parse import urljoin, quote
from .base import BaseConnector
from ._http import get
from utils.normalize import make_job

BASE_URL = "https://www.workatastartup.com"


class WorkAtAStartupConnector(BaseConnector):
    name = "Work at a Startup"
    implemented = True

    def search(self, role, location, skills, experience, timeout=8):
        query = quote(role or "")
        url = f"{BASE_URL}/jobs?role={query}" if query else f"{BASE_URL}/jobs"
        resp = get(url, timeout=timeout, referer=BASE_URL)
        soup = BeautifulSoup(resp.text, "html.parser")

        cards = soup.select("a.job-title-link, div.job-listing")
        if not cards:
            cards = [a for a in soup.select("a[href*='/jobs/']") if a.get_text(strip=True)]
        for card in cards:
            link = card if card.name == "a" else card.select_one("a")
            if not link or not link.get("href"):
                continue

            title = link.get_text(strip=True)
            company_el = card.find_next("span", class_="company-name") or card.select_one(".company")
            location_el = card.select_one(".location")

            if not title:
                continue

            job = make_job(
                title=title,
                company=company_el.get_text(strip=True) if company_el else "YC-backed startup",
                source="Work at a Startup",
                location=location_el.get_text(strip=True) if location_el else location or "Remote/Various",
                experience=experience or None,
                salary=None,
                skills=[],
                work_mode=None,
                employment_type=None,
                posted_date=None,
                description=None,
                requirements=[],
                url=urljoin(BASE_URL, link.get("href", "")),
            )
            jobs.append(job)

        return jobs

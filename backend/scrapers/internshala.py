"""
Internshala — public job search-results pages (no login required to browse
listings). Keep request rate low and cache results; this is still a
best-effort HTML scrape and Internshala's markup can change without notice.
"""

from bs4 import BeautifulSoup
from urllib.parse import urljoin, quote
from .base import BaseConnector
from ._http import get
from utils.normalize import make_job

BASE_URL = "https://internshala.com"


class InternshalaConnector(BaseConnector):
    name = "Internshala"
    implemented = True

    def search(self, role, location, skills, experience, timeout=8):
        keyword = quote(role or "jobs")
        url = f"{BASE_URL}/jobs/keywords-{keyword}"
        resp = get(url, timeout=timeout, referer=BASE_URL)
        soup = BeautifulSoup(resp.text, "html.parser")

        jobs = []
        cards = soup.select("div.individual_internship, div.job-internship-card")
        for card in cards:
            title_el = card.select_one("a.job-title-href, h3.job-internship-name a")
            company_el = card.select_one("p.company-name, div.company_name a")
            location_el = card.select_one("a.location_link, div.row-1-item span")
            stipend_el = card.select_one("span.stipend")

            if not title_el:
                continue

            job = make_job(
                title=title_el.get_text(strip=True),
                company=company_el.get_text(strip=True) if company_el else "Unknown",
                source="Internshala",
                location=location_el.get_text(strip=True) if location_el else location or "India",
                experience=experience or None,
                salary=stipend_el.get_text(strip=True) if stipend_el else None,
                skills=[],
                work_mode=None,
                employment_type=None,
                posted_date=None,
                description=None,
                requirements=[],
                url=urljoin(BASE_URL, title_el.get("href", "")),
            )
            jobs.append(job)

        return jobs

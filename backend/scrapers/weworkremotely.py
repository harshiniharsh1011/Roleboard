"""
We Work Remotely — public, unauthenticated category pages.
robots.txt on weworkremotely.com allows crawling of /categories/ and
/remote-jobs/ paths; no login or anti-bot wall sits in front of them.

NOTE: like any HTML scraper, this depends on WWR's current markup. If WWR
changes its templates, update the CSS selectors below — the rest of the
app is unaffected because everything downstream only sees the normalized
job schema.
"""

from bs4 import BeautifulSoup
from urllib.parse import urljoin
from .base import BaseConnector
from ._http import get
from utils.normalize import make_job

BASE_URL = "https://weworkremotely.com"
CATEGORY_URL = f"{BASE_URL}/categories/remote-programming-jobs"


class WeWorkRemotelyConnector(BaseConnector):
    name = "WeWorkRemotely"
    implemented = True

    def search(self, role, location, skills, experience, timeout=8):
        resp = get(CATEGORY_URL, timeout=timeout, referer=BASE_URL)
        soup = BeautifulSoup(resp.text, "html.parser")

        # Primary: WWR's known list structure. Fallback: any anchor
        # pointing at a /remote-jobs/ posting, wherever it sits in the DOM.
        anchors = [
            link for link in soup.select("a[href^='/remote-jobs/']")
            if link.select_one("h3, span.title")
        ]

        jobs = []
        for link in anchors:
            container = link.find_parent("li") or link
            title_el = link.select_one("h3, span.title") or container.select_one("h3, span.title")
            company_el = link.select_one(".new-listing__company-name, span.company")
            region_el = container.select_one("span.region")

            title = title_el.get_text(" ", strip=True) if title_el else ""
            if not title:
                continue

            job = make_job(
                title=title,
                company=company_el.get_text(" ", strip=True) if company_el else "Unknown",
                source="WeWorkRemotely",
                location=region_el.get_text(strip=True) if region_el else "Remote",
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

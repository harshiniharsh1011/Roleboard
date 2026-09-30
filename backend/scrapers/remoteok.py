"""
RemoteOK — the public HTML board at remoteok.com. Deliberately scrapes the
rendered HTML table, NOT remoteok.com/api, to honor the "no APIs at all"
requirement even though RemoteOK happens to also offer a JSON feed.
"""

from bs4 import BeautifulSoup
from urllib.parse import urljoin, quote
from .base import BaseConnector
from ._http import get
from utils.normalize import make_job

BASE_URL = "https://remoteok.com"


class RemoteOKConnector(BaseConnector):
    name = "RemoteOK"
    implemented = True

    def search(self, role, location, skills, experience, timeout=8):
        query = quote((role or "").replace(" ", "-"))
        url = f"{BASE_URL}/remote-{query}-jobs" if query else f"{BASE_URL}/remote-jobs"
        resp = get(url, timeout=timeout, referer=BASE_URL)
        soup = BeautifulSoup(resp.text, "html.parser")

        rows = soup.select("tr.job")
        if not rows:
            # Fallback: RemoteOK sometimes swaps table rows for article/div
            # cards depending on the template in use.
            rows = soup.select("tr[data-id], article.job, div.job_list_item")

        jobs = []
        for row in rows:
            title_el = row.select_one("h2, [itemprop='title']")
            company_el = row.select_one("h3, [itemprop='name']")
            tags = [t.get_text(strip=True) for t in row.select("div.tags h3, .tag")]
            job_id = row.get("data-id") or row.get("id", "").replace("job_", "")
            href = row.get("data-url") or (f"/remote-jobs/{job_id}" if job_id else None)

            title = title_el.get_text(strip=True) if title_el else None
            if not title or not href:
                continue

            job = make_job(
                title=title,
                company=company_el.get_text(strip=True) if company_el else "Unknown",
                source="RemoteOK",
                location="Remote",
                experience=None,
                salary=None,
                skills=tags,
                work_mode="Remote",
                employment_type=None,
                posted_date=None,
                description=None,
                requirements=[],
                url=urljoin(BASE_URL, href),
            )
            jobs.append(job)

        return jobs

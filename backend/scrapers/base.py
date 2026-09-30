"""
Every portal is a "connector" with the same interface:

    search(role, location, skills, experience) -> list[job dict]

This is the plug point the spec asks for: a connector that currently can't
scrape (because the portal's Terms of Service prohibit automated access)
can be swapped later for one that pulls from a permitted source (an
official employer/partner feed, an RSS feed the portal itself publishes,
a licensed data provider, etc.) without any change to app.py or the
frontend — they only ever see the common job schema.
"""

from abc import ABC, abstractmethod


class BaseConnector(ABC):
    name = "base"
    # True  -> this module does real HTTP requests + HTML parsing against
    #          a source that permits it (checked robots.txt / public pages).
    # False -> stubbed out; the portal's ToS / anti-bot protection means we
    #          do not attempt automated access. Returns [] plus a note.
    implemented = False
    restriction_note = None

    @abstractmethod
    def search(self, role, location, skills, experience, timeout=8):
        """Return a list of job dicts (see utils.normalize.JOB_SCHEMA_FIELDS)."""
        raise NotImplementedError

    def safe_search(self, *args, **kwargs):
        """Wrap search() so one flaky source never breaks the whole request."""
        import requests

        if not self.implemented:
            return [], {"level": "restricted", "message": self.restriction_note}
        try:
            jobs = self.search(*args, **kwargs)
            if not jobs:
                return [], {
                    "level": "empty",
                    "message": f"{self.name} returned no results for this search — either "
                               f"nothing matched, or the site's page layout changed and the "
                               f"scraper's selectors need updating.",
                }
            return jobs, None
        except requests.exceptions.HTTPError as exc:
            status = getattr(exc.response, "status_code", "?")
            return [], {
                "level": "blocked",
                "message": f"{self.name} blocked the request (HTTP {status}) — likely bot "
                           f"protection kicking in. Try again later or from a different network.",
            }
        except requests.exceptions.RequestException as exc:
            return [], {
                "level": "error",
                "message": f"{self.name} couldn't be reached ({exc.__class__.__name__}).",
            }
        except Exception as exc:  # noqa: BLE001 - want to surface any failure
            return [], {
                "level": "error",
                "message": f"{self.name} is temporarily unavailable ({exc.__class__.__name__}).",
            }

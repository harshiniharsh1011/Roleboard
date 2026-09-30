"""
Naukri, Indeed, LinkedIn, Glassdoor, Foundit, Wellfound
all prohibit automated scraping in their Terms of Service, and most also
sit behind JS rendering + anti-bot/CAPTCHA protection that this project is
explicitly instructed not to bypass.

Each class below is a fully wired connector with `implemented = False`, so:
  - it shows up in the UI's portal list normally,
  - selecting it returns zero jobs plus a clear "restricted" message
    instead of silently failing or faking data,
  - swapping in a permitted source later (an official employer/partner
    feed, a licensed aggregator feed, an RSS the portal itself publishes)
    is a one-line change: set implemented = True and fill in search().
"""

from .base import BaseConnector


def _restricted(name):
    note = (
        f"{name} prohibits automated scraping in its Terms of Service "
        f"and/or uses anti-bot protection. This connector is stubbed out "
        f"rather than bypassing that protection. Swap in a permitted "
        f"source (official feed, partner API, licensed data) to activate it."
    )
    return type(
        f"{name.replace(' ', '')}Connector",
        (BaseConnector,),
        {
            "name": name,
            "implemented": False,
            "restriction_note": note,
            "search": lambda self, *a, **kw: [],
        },
    )


NaukriConnector = _restricted("Naukri")
IndeedConnector = _restricted("Indeed")
LinkedInConnector = _restricted("LinkedIn")
GlassdoorConnector = _restricted("Glassdoor")
FounditConnector = _restricted("Foundit")
WellfoundConnector = _restricted("Wellfound")
# ZipRecruiterConnector = _restricted("ZipRecruiter")

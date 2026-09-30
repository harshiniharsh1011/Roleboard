from .weworkremotely import WeWorkRemotelyConnector
from .internshala import InternshalaConnector
from .himalayas import HimalayasConnector
from .remoteok import RemoteOKConnector
from .workatastartup import WorkAtAStartupConnector
from .restricted import (
    NaukriConnector, IndeedConnector, LinkedInConnector, GlassdoorConnector,
    FounditConnector, WellfoundConnector,
)

# id -> (display name, connector instance)
REGISTRY = {
    "weworkremotely": ("WeWorkRemotely", WeWorkRemotelyConnector()),
    "internshala": ("Internshala", InternshalaConnector()),
    "himalayas": ("Himalayas", HimalayasConnector()),
    "remoteok": ("RemoteOK", RemoteOKConnector()),
    "workatastartup": ("Work at a Startup", WorkAtAStartupConnector()),
    "naukri": ("Naukri", NaukriConnector()),
    "indeed": ("Indeed", IndeedConnector()),
    "linkedin": ("LinkedIn", LinkedInConnector()),
    "glassdoor": ("Glassdoor", GlassdoorConnector()),
    "foundit": ("Foundit", FounditConnector()),
    "wellfound": ("Wellfound", WellfoundConnector()),
    # "ziprecruiter": ("ZipRecruiter", ZipRecruiterConnector()),
}


def list_portals():
    return [
        {"id": pid, "name": name, "implemented": conn.implemented}
        for pid, (name, conn) in REGISTRY.items()
    ]

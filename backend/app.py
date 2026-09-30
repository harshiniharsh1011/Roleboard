from flask import Flask, request, jsonify
from flask_cors import CORS
from concurrent.futures import ThreadPoolExecutor, as_completed

from scrapers import REGISTRY, list_portals
from utils.normalize import filter_and_rank

app = Flask(__name__)
CORS(app)


@app.get("/api/portals")
def portals():
    """List every portal the UI can offer as a checkbox."""
    return jsonify(list_portals())


@app.post("/api/search")
def search():
    body = request.get_json(force=True, silent=True) or {}

    role = (body.get("role") or "").strip()
    experience = (body.get("experience") or "Any").strip()
    location = (body.get("location") or "").strip()
    skills = (body.get("skills") or "").strip()
    sort_by = (body.get("sort_by") or "relevance").strip()
    selected_portals = body.get("portals") or []

    # ---- validation / error handling -----------------------------------
    if not role:
        return jsonify({"error": "Please enter a job role to search for."}), 400
    if not selected_portals:
        return jsonify({"error": "Select at least one job portal to search."}), 400

    unknown = [p for p in selected_portals if p not in REGISTRY]
    if unknown:
        return jsonify({"error": f"Unknown portal(s): {', '.join(unknown)}"}), 400

    # ---- fan out to each selected connector in parallel -----------------
    all_jobs = []
    source_notes = {}

    def run_one(portal_id):
        name, connector = REGISTRY[portal_id]
        jobs, note = connector.safe_search(role, location, skills, experience)
        return portal_id, name, jobs, note

    with ThreadPoolExecutor(max_workers=max(1, len(selected_portals))) as pool:
        futures = [pool.submit(run_one, pid) for pid in selected_portals]
        for fut in as_completed(futures):
            portal_id, name, jobs, note = fut.result()
            if note:
                # note is {"level": "restricted"|"empty"|"blocked"|"error", "message": str}
                source_notes[name] = note
            all_jobs.extend(jobs)

    ranked = filter_and_rank(all_jobs, role, experience, location, skills, sort_by)

    counts_by_source = {}
    for j in ranked:
        counts_by_source[j["source"]] = counts_by_source.get(j["source"], 0) + 1

    return jsonify({
        "count": len(ranked),
        "jobs": ranked,
        "source_notes": source_notes,
        "counts_by_source": counts_by_source,
    })


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)

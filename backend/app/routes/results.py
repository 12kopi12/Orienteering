from flask import Blueprint, jsonify, g
from app.extensions import db
from app.models import Race, Category, RaceEntry, EntryStatus, RaceStatus, format_seconds
from app.auth import optional_admin

results_bp = Blueprint("results", __name__, url_prefix="/api")


@results_bp.route("/races/<int:race_id>/results", methods=["GET"])
@optional_admin
def get_race_results(race_id: int):
    race = db.session.get(Race, race_id)
    if not race:
        return jsonify({"error": "Závod nenalezen"}), 404

    # Public can ONLY see results of finished races
    if not g.current_user and race.status != RaceStatus.FINISHED:
        return jsonify({"error": "Výsledky nejsou veřejně přístupné, protože závod ještě nebyl ukončen"}), 403

    categories = Category.query.filter_by(race_id=race.id).order_by(Category.name.asc()).all()
    categories_results = []

    for cat in categories:
        entries = RaceEntry.query.filter_by(category_id=cat.id).all()

        finishers = []
        non_finishers = []

        for e in entries:
            if e.status == EntryStatus.FINISHED and e.result_time_seconds is not None:
                finishers.append(e)
            else:
                non_finishers.append(e)

        # Sort finishers by time ascending
        finishers.sort(key=lambda x: x.result_time_seconds)

        # Sort non-finishers by status priority then bib number
        status_priority = {
            EntryStatus.DNF: 1,
            EntryStatus.DISQ: 2,
            EntryStatus.DNS: 3,
            EntryStatus.RUNNING: 4,
            EntryStatus.REGISTERED: 5,
        }
        non_finishers.sort(key=lambda x: (status_priority.get(x.status, 99), x.bib_number or 9999))

        results_list = []
        winner_time = finishers[0].result_time_seconds if finishers else None

        for idx, e in enumerate(finishers):
            loss = e.result_time_seconds - winner_time if winner_time is not None else 0
            results_list.append({
                "rank": idx + 1,
                "bib_number": e.bib_number,
                "competitor": e.competitor.to_dict() if e.competitor else None,
                "result_time_seconds": e.result_time_seconds,
                "result_time_formatted": format_seconds(e.result_time_seconds),
                "gap": f"+{format_seconds(loss)}" if loss > 0 else "-",
                "gap_seconds": loss,
                "status": e.status,
                "note": e.note,
            })

        for e in non_finishers:
            results_list.append({
                "rank": None,
                "bib_number": e.bib_number,
                "competitor": e.competitor.to_dict() if e.competitor else None,
                "result_time_seconds": None,
                "result_time_formatted": None,
                "gap": None,
                "gap_seconds": None,
                "status": e.status,
                "note": e.note,
            })

        categories_results.append({
            "category": cat.to_dict(include_entries=False),
            "total_participants": len(entries),
            "finishers_count": len(finishers),
            "results": results_list,
        })

    return jsonify({
        "race": race.to_dict(include_categories=False),
        "categories": categories_results,
    })

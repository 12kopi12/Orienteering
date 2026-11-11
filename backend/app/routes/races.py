from datetime import datetime
from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.models import Race, RaceStatus
from app.auth import admin_required, optional_admin

races_bp = Blueprint("races", __name__, url_prefix="/api/races")


@races_bp.route("", methods=["GET"])
@optional_admin
def list_races():
    query = Race.query
    # Non-admin sees ONLY finished races
    if not g.current_user:
        query = query.filter_by(status=RaceStatus.FINISHED)
    
    races = query.order_by(Race.event_date.desc().nullslast(), Race.created_at.desc()).all()
    return jsonify([race.to_dict(include_categories=True) for race in races])


@races_bp.route("", methods=["POST"])
@admin_required
def create_race():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Název závodu je povinný"}), 400

    location = (data.get("location") or "").strip() or None
    description = (data.get("description") or "").strip() or None
    event_date_raw = data.get("event_date")

    event_date = None
    if event_date_raw:
        try:
            event_date = datetime.fromisoformat(event_date_raw.replace("Z", "+00:00"))
        except ValueError:
            return jsonify({"error": "Neplatný formát data a času (použijte ISO formát)"}), 400

    race = Race(
        name=name,
        location=location,
        event_date=event_date,
        description=description,
        status=RaceStatus.DRAFT
    )
    db.session.add(race)
    db.session.commit()

    return jsonify(race.to_dict(include_categories=True)), 201


@races_bp.route("/<int:race_id>", methods=["GET"])
@optional_admin
def get_race(race_id: int):
    race = db.session.get(Race, race_id)
    if not race:
        return jsonify({"error": "Závod nenalezen"}), 404

    # Public can only view finished races
    if not g.current_user and race.status != RaceStatus.FINISHED:
        return jsonify({"error": "Závod není veřejně přístupný, protože ještě nebyl ukončen"}), 403

    return jsonify(race.to_dict(include_categories=True))


@races_bp.route("/<int:race_id>", methods=["PUT"])
@admin_required
def update_race(race_id: int):
    race = db.session.get(Race, race_id)
    if not race:
        return jsonify({"error": "Závod nenalezen"}), 404

    data = request.get_json() or {}
    if "name" in data:
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Název závodu nesmí být prázdný"}), 400
        race.name = name

    if "location" in data:
        race.location = (data.get("location") or "").strip() or None

    if "description" in data:
        race.description = (data.get("description") or "").strip() or None

    if "event_date" in data:
        event_date_raw = data.get("event_date")
        if event_date_raw:
            try:
                race.event_date = datetime.fromisoformat(event_date_raw.replace("Z", "+00:00"))
            except ValueError:
                return jsonify({"error": "Neplatný formát data a času"}), 400
        else:
            race.event_date = None

    db.session.commit()
    return jsonify(race.to_dict(include_categories=True))


@races_bp.route("/<int:race_id>/status", methods=["PUT"])
@admin_required
def update_race_status(race_id: int):
    race = db.session.get(Race, race_id)
    if not race:
        return jsonify({"error": "Závod nenalezen"}), 404

    data = request.get_json() or {}
    status = data.get("status")
    if status not in RaceStatus.ALL:
        return jsonify({"error": f"Neplatný stav. Povolené stavy: {', '.join(RaceStatus.ALL)}"}), 400

    race.status = status
    db.session.commit()
    return jsonify(race.to_dict(include_categories=True))


@races_bp.route("/<int:race_id>", methods=["DELETE"])
@admin_required
def delete_race(race_id: int):
    race = db.session.get(Race, race_id)
    if not race:
        return jsonify({"error": "Závod nenalezen"}), 404

    db.session.delete(race)
    db.session.commit()
    return jsonify({"message": "Závod byl úspěšně smazán"})

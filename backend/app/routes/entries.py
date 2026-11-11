from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from app.extensions import db
from app.models import Category, Competitor, RaceEntry, EntryStatus, RaceStatus
from app.auth import admin_required, optional_admin

entries_bp = Blueprint("entries", __name__, url_prefix="/api")


def make_aware(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def parse_time_input(val) -> int | None:
    if val is None or val == "":
        return None
    if isinstance(val, (int, float)):
        return max(0, int(val))
    val_str = str(val).strip()
    if ":" in val_str:
        parts = [int(p) for p in val_str.split(":")]
        if len(parts) == 2:
            return max(0, parts[0] * 60 + parts[1])
        elif len(parts) == 3:
            return max(0, parts[0] * 3600 + parts[1] * 60 + parts[2])
    return max(0, int(val_str))


@entries_bp.route("/categories/<int:category_id>/entries", methods=["GET"])
@optional_admin
def list_entries(category_id: int):
    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({"error": "Kategorie nenalezena"}), 404

    # Non-admin only allowed if race is finished
    if not g.current_user and category.race.status != RaceStatus.FINISHED:
        return jsonify({"error": "Startovní listina není veřejně přístupná před ukončením závodu"}), 403

    entries = (
        RaceEntry.query.filter_by(category_id=category_id)
        .order_by(RaceEntry.bib_number.asc().nullslast(), RaceEntry.id.asc())
        .all()
    )
    return jsonify([e.to_dict() for e in entries])


@entries_bp.route("/categories/<int:category_id>/entries", methods=["POST"])
@admin_required
def create_entry(category_id: int):
    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({"error": "Kategorie nenalezena"}), 404

    data = request.get_json() or {}
    competitor_id = data.get("competitor_id")

    # If competitor_id not supplied, check if new competitor fields are provided
    if not competitor_id:
        first_name = (data.get("first_name") or "").strip()
        last_name = (data.get("last_name") or "").strip()
        if not first_name or not last_name:
            return jsonify({"error": "Vyberte závodníka nebo zadejte jméno a příjmení nového závodníka"}), 400

        club = (data.get("club") or "").strip() or None
        reg_number = (data.get("reg_number") or "").strip() or None

        competitor = Competitor(
            first_name=first_name,
            last_name=last_name,
            club=club,
            reg_number=reg_number
        )
        db.session.add(competitor)
        db.session.flush()
        competitor_id = competitor.id
    else:
        competitor = db.session.get(Competitor, competitor_id)
        if not competitor:
            return jsonify({"error": "Zvolený závodník neexistuje"}), 404

    # Calculate next bib number if not specified
    bib_number = data.get("bib_number")
    if bib_number is not None and bib_number != "":
        try:
            bib_number = int(bib_number)
        except ValueError:
            return jsonify({"error": "Startovní číslo musí být číslo"}), 400
    else:
        existing_max = (
            db.session.query(db.func.max(RaceEntry.bib_number))
            .join(Category, RaceEntry.category_id == Category.id)
            .filter(Category.race_id == category.race_id)
            .scalar()
        )
        bib_number = (existing_max or 0) + 1

    entry = RaceEntry(
        category_id=category_id,
        competitor_id=competitor_id,
        bib_number=bib_number,
        status=EntryStatus.REGISTERED,
        note=(data.get("note") or "").strip() or None
    )
    db.session.add(entry)
    db.session.commit()

    return jsonify(entry.to_dict()), 201


@entries_bp.route("/entries/<int:entry_id>/start", methods=["POST"])
@admin_required
def start_entry(entry_id: int):
    entry = db.session.get(RaceEntry, entry_id)
    if not entry:
        return jsonify({"error": "Záznam přihlášky nenalezen"}), 404

    data = request.get_json(silent=True) or {}
    started_at_raw = data.get("started_at")
    if started_at_raw:
        try:
            entry.started_at = datetime.fromisoformat(started_at_raw.replace("Z", "+00:00"))
        except ValueError:
            return jsonify({"error": "Neplatný formát data a času"}), 400
    else:
        entry.started_at = datetime.now(timezone.utc)

    entry.finished_at = None
    entry.result_time_seconds = None
    entry.status = EntryStatus.RUNNING
    db.session.commit()

    return jsonify(entry.to_dict())


@entries_bp.route("/entries/<int:entry_id>/finish", methods=["POST"])
@admin_required
def finish_entry(entry_id: int):
    entry = db.session.get(RaceEntry, entry_id)
    if not entry:
        return jsonify({"error": "Záznam přihlášky nenalezen"}), 404

    data = request.get_json(silent=True) or {}
    finished_at_raw = data.get("finished_at")
    if finished_at_raw:
        try:
            finish_dt = datetime.fromisoformat(finished_at_raw.replace("Z", "+00:00"))
        except ValueError:
            return jsonify({"error": "Neplatný formát data a času"}), 400
    else:
        finish_dt = datetime.now(timezone.utc)

    entry.finished_at = finish_dt

    if entry.started_at:
        start_aware = make_aware(entry.started_at)
        finish_aware = make_aware(entry.finished_at)
        delta = (finish_aware - start_aware).total_seconds()
        entry.result_time_seconds = max(0, int(delta))
    elif "result_time_seconds" in data:
        try:
            entry.result_time_seconds = parse_time_input(data.get("result_time_seconds"))
        except (ValueError, TypeError):
            pass

    entry.status = EntryStatus.FINISHED
    db.session.commit()

    return jsonify(entry.to_dict())


@entries_bp.route("/entries/<int:entry_id>", methods=["PUT"])
@admin_required
def update_entry(entry_id: int):
    entry = db.session.get(RaceEntry, entry_id)
    if not entry:
        return jsonify({"error": "Záznam přihlášky nenalezen"}), 404

    data = request.get_json() or {}

    if "bib_number" in data:
        val = data.get("bib_number")
        try:
            entry.bib_number = int(val) if val is not None and val != "" else None
        except (ValueError, TypeError):
            return jsonify({"error": "Startovní číslo musí být číslo"}), 400

    if "status" in data:
        status = data.get("status")
        if status not in EntryStatus.ALL:
            return jsonify({"error": f"Neplatný stav. Povolené: {', '.join(EntryStatus.ALL)}"}), 400
        entry.status = status

    if "result_time" in data or "result_time_seconds" in data:
        raw_val = data.get("result_time") if "result_time" in data else data.get("result_time_seconds")
        try:
            entry.result_time_seconds = parse_time_input(raw_val)
        except (ValueError, TypeError):
            return jsonify({"error": "Neplatný čas (zadejte sekundy nebo formát MM:SS či HH:MM:SS)"}), 400

    if "started_at" in data:
        raw_val = data.get("started_at")
        if raw_val:
            try:
                entry.started_at = datetime.fromisoformat(raw_val.replace("Z", "+00:00"))
            except ValueError:
                return jsonify({"error": "Neplatný formát data startu"}), 400
        else:
            entry.started_at = None

    if "finished_at" in data:
        raw_val = data.get("finished_at")
        if raw_val:
            try:
                entry.finished_at = datetime.fromisoformat(raw_val.replace("Z", "+00:00"))
            except ValueError:
                return jsonify({"error": "Neplatný formát data cíle"}), 400
        else:
            entry.finished_at = None

    if "note" in data:
        entry.note = (data.get("note") or "").strip() or None

    db.session.commit()
    return jsonify(entry.to_dict())


@entries_bp.route("/entries/<int:entry_id>", methods=["DELETE"])
@admin_required
def delete_entry(entry_id: int):
    entry = db.session.get(RaceEntry, entry_id)
    if not entry:
        return jsonify({"error": "Záznam přihlášky nenalezen"}), 404

    db.session.delete(entry)
    db.session.commit()
    return jsonify({"message": "Přihláška byla úspěšně smazána"})

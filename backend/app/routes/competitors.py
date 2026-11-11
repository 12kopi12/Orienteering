from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Competitor
from app.auth import admin_required

competitors_bp = Blueprint("competitors", __name__, url_prefix="/api/competitors")


@competitors_bp.route("", methods=["GET"])
@admin_required
def list_competitors():
    search = request.args.get("q", "").strip()
    query = Competitor.query
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Competitor.first_name.ilike(search_pattern)) |
            (Competitor.last_name.ilike(search_pattern)) |
            (Competitor.club.ilike(search_pattern)) |
            (Competitor.reg_number.ilike(search_pattern))
        )
    competitors = query.order_by(Competitor.last_name, Competitor.first_name).all()
    return jsonify([c.to_dict() for c in competitors])


@competitors_bp.route("", methods=["POST"])
@admin_required
def create_competitor():
    data = request.get_json() or {}
    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip()

    if not first_name or not last_name:
        return jsonify({"error": "Jméno a příjmení závodníka jsou povinná pole"}), 400

    club = (data.get("club") or "").strip() or None
    reg_number = (data.get("reg_number") or "").strip() or None

    competitor = Competitor(
        first_name=first_name,
        last_name=last_name,
        club=club,
        reg_number=reg_number
    )
    db.session.add(competitor)
    db.session.commit()

    return jsonify(competitor.to_dict()), 201


@competitors_bp.route("/<int:competitor_id>", methods=["PUT"])
@admin_required
def update_competitor(competitor_id: int):
    competitor = db.session.get(Competitor, competitor_id)
    if not competitor:
        return jsonify({"error": "Závodník nenalezen"}), 404

    data = request.get_json() or {}
    if "first_name" in data:
        first_name = (data.get("first_name") or "").strip()
        if not first_name:
            return jsonify({"error": "Jméno nesmí být prázdné"}), 400
        competitor.first_name = first_name

    if "last_name" in data:
        last_name = (data.get("last_name") or "").strip()
        if not last_name:
            return jsonify({"error": "Příjmení nesmí být prázdné"}), 400
        competitor.last_name = last_name

    if "club" in data:
        competitor.club = (data.get("club") or "").strip() or None

    if "reg_number" in data:
        competitor.reg_number = (data.get("reg_number") or "").strip() or None

    db.session.commit()
    return jsonify(competitor.to_dict())


@competitors_bp.route("/<int:competitor_id>", methods=["DELETE"])
@admin_required
def delete_competitor(competitor_id: int):
    competitor = db.session.get(Competitor, competitor_id)
    if not competitor:
        return jsonify({"error": "Závodník nenalezen"}), 404

    db.session.delete(competitor)
    db.session.commit()
    return jsonify({"message": "Závodník byl úspěšně smazán"})

from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Race, Category
from app.auth import admin_required

categories_bp = Blueprint("categories", __name__, url_prefix="/api")


@categories_bp.route("/races/<int:race_id>/categories", methods=["POST"])
@admin_required
def create_category(race_id: int):
    race = db.session.get(Race, race_id)
    if not race:
        return jsonify({"error": "Závod nenalezen"}), 404

    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Název kategorie je povinný"}), 400

    distance_km = data.get("distance_km")
    elevation_m = data.get("elevation_m")

    try:
        distance_km = float(distance_km) if distance_km is not None and distance_km != "" else None
    except (ValueError, TypeError):
        return jsonify({"error": "Délka tratě musí být číslo"}), 400

    try:
        elevation_m = int(elevation_m) if elevation_m is not None and elevation_m != "" else None
    except (ValueError, TypeError):
        return jsonify({"error": "Převýšení musí být celé číslo"}), 400

    category = Category(
        race_id=race_id,
        name=name,
        distance_km=distance_km,
        elevation_m=elevation_m
    )
    db.session.add(category)
    db.session.commit()

    return jsonify(category.to_dict()), 201


@categories_bp.route("/categories/<int:category_id>", methods=["PUT"])
@admin_required
def update_category(category_id: int):
    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({"error": "Kategorie nenalezena"}), 404

    data = request.get_json() or {}
    if "name" in data:
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Název kategorie nesmí být prázdný"}), 400
        category.name = name

    if "distance_km" in data:
        val = data.get("distance_km")
        try:
            category.distance_km = float(val) if val is not None and val != "" else None
        except (ValueError, TypeError):
            return jsonify({"error": "Délka tratě musí být číslo"}), 400

    if "elevation_m" in data:
        val = data.get("elevation_m")
        try:
            category.elevation_m = int(val) if val is not None and val != "" else None
        except (ValueError, TypeError):
            return jsonify({"error": "Převýšení musí být celé číslo"}), 400

    db.session.commit()
    return jsonify(category.to_dict())


@categories_bp.route("/categories/<int:category_id>", methods=["DELETE"])
@admin_required
def delete_category(category_id: int):
    category = db.session.get(Category, category_id)
    if not category:
        return jsonify({"error": "Kategorie nenalezena"}), 404

    db.session.delete(category)
    db.session.commit()
    return jsonify({"message": "Kategorie byla úspěšně smazána"})

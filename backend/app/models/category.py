from app.extensions import db


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    race_id = db.Column(db.Integer, db.ForeignKey("races.id", ondelete="CASCADE"), nullable=False, index=True)
    name = db.Column(db.String(50), nullable=False)
    distance_km = db.Column(db.Float, nullable=True)
    elevation_m = db.Column(db.Integer, nullable=True)

    entries = db.relationship(
        "RaceEntry",
        backref="category",
        cascade="all, delete-orphan",
        order_by="RaceEntry.bib_number",
        lazy="joined"
    )

    def to_dict(self, include_entries=False):
        data = {
            "id": self.id,
            "race_id": self.race_id,
            "name": self.name,
            "distance_km": self.distance_km,
            "elevation_m": self.elevation_m,
            "entry_count": len(self.entries) if self.entries else 0,
        }
        if include_entries:
            data["entries"] = [e.to_dict() for e in self.entries]
        return data

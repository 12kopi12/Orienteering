from datetime import datetime, timezone
from app.extensions import db


class Competitor(db.Model):
    __tablename__ = "competitors"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    club = db.Column(db.String(80), nullable=True, index=True)
    reg_number = db.Column(db.String(30), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    entries = db.relationship("RaceEntry", backref="competitor", cascade="all, delete-orphan", lazy="select")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": self.full_name,
            "club": self.club,
            "reg_number": self.reg_number,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

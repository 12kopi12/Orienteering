from datetime import datetime, timezone
from app.extensions import db


class RaceStatus:
    DRAFT = "DRAFT"
    IN_PROGRESS = "IN_PROGRESS"
    FINISHED = "FINISHED"

    ALL = [DRAFT, IN_PROGRESS, FINISHED]


class Race(db.Model):
    __tablename__ = "races"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    location = db.Column(db.String(150), nullable=True)
    event_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), nullable=False, default=RaceStatus.DRAFT, index=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    categories = db.relationship(
        "Category",
        backref="race",
        cascade="all, delete-orphan",
        order_by="Category.name",
        lazy="joined"
    )

    def to_dict(self, include_categories=False):
        data = {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "event_date": self.event_date.isoformat() if self.event_date else None,
            "status": self.status,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "category_count": len(self.categories) if self.categories else 0,
        }
        if include_categories:
            data["categories"] = [c.to_dict(include_entries=False) for c in self.categories]
        return data

from datetime import datetime
from app.extensions import db


class EntryStatus:
    REGISTERED = "REGISTERED"
    RUNNING = "RUNNING"
    FINISHED = "FINISHED"
    DNF = "DNF"
    DISQ = "DISQ"
    DNS = "DNS"

    ALL = [REGISTERED, RUNNING, FINISHED, DNF, DISQ, DNS]


def format_seconds(seconds: int | None) -> str | None:
    if seconds is None:
        return None
    seconds = max(0, int(seconds))
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"


class RaceEntry(db.Model):
    __tablename__ = "race_entries"

    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)
    competitor_id = db.Column(db.Integer, db.ForeignKey("competitor.id" if False else "competitors.id", ondelete="CASCADE"), nullable=False, index=True)
    bib_number = db.Column(db.Integer, nullable=True)

    started_at = db.Column(db.DateTime, nullable=True)
    finished_at = db.Column(db.DateTime, nullable=True)
    result_time_seconds = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(20), nullable=False, default=EntryStatus.REGISTERED, index=True)
    note = db.Column(db.String(255), nullable=True)

    def calculate_result_time(self):
        if self.started_at and self.finished_at:
            delta = (self.finished_at - self.started_at).total_seconds()
            self.result_time_seconds = max(0, int(delta))
        return self.result_time_seconds

    def to_dict(self):
        return {
            "id": self.id,
            "category_id": self.category_id,
            "competitor_id": self.competitor_id,
            "competitor": self.competitor.to_dict() if self.competitor else None,
            "bib_number": self.bib_number,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "finished_at": self.finished_at.isoformat() if self.finished_at else None,
            "result_time_seconds": self.result_time_seconds,
            "result_time_formatted": format_seconds(self.result_time_seconds),
            "status": self.status,
            "note": self.note,
        }

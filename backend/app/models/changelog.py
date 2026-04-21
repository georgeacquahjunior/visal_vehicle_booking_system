from .. import db
from datetime import datetime

class Changelog(db.Model):
    """
    Represents a changelog entry for tracking system changes and updates.
    """
    __tablename__ = "changelogs"

    id = db.Column(db.Integer, primary_key=True)
    version = db.Column(db.String(50), nullable=False)  # e.g., "1.0.0"
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(
        db.String(50),
        nullable=False,
        default="General"
    )  # e.g., "Feature", "Bug Fix", "Improvement", "General"
    author_id = db.Column(
        db.String(20),
        db.ForeignKey("users.staff_id", ondelete="SET NULL"),
        nullable=True
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    is_published = db.Column(db.Boolean, default=False, nullable=False)

    # Relationship to User
    author = db.relationship("User", backref=db.backref("changelogs", lazy=True))

    def __init__(self, version, title, description, category="General", author_id=None, is_published=False):
        self.version = version
        self.title = title
        self.description = description
        self.category = category
        self.author_id = author_id
        self.is_published = is_published

    def to_dict(self):
        """Convert changelog entry to dictionary."""
        return {
            "id": self.id,
            "version": self.version,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "author": self.author.full_name if self.author else "System",
            "author_id": self.author_id,
            "created_at": self.created_at.isoformat(),
            "is_published": self.is_published,
        }

    def __repr__(self):
        return f"<Changelog {self.version} | {self.title}>"

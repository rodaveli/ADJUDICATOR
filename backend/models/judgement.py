from . import db


class Judgement(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    session_id = db.Column(db.String(36),
                           db.ForeignKey('session.id'),
                           nullable=False)
    content = db.Column(db.Text, nullable=False)

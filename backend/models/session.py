from . import db


class Session(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    creator_id = db.Column(db.String(36),
                           db.ForeignKey('user.id'),
                           nullable=False)


class SessionParticipant(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    session_id = db.Column(db.String(36),
                           db.ForeignKey('session.id'),
                           nullable=False)
    user_id = db.Column(db.String(36),
                        db.ForeignKey('user.id'),
                        nullable=False)

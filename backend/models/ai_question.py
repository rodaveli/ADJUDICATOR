from . import db


class AIQuestion(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    session_id = db.Column(db.String(36),
                           db.ForeignKey('session.id'),
                           nullable=False)
    question = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20),
                       nullable=False)  # 'pending' or 'answered'

from . import db


class Argument(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    session_id = db.Column(db.String(36),
                           db.ForeignKey('session.id'),
                           nullable=False)
    user_id = db.Column(db.String(36),
                        db.ForeignKey('user.id'),
                        nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_path = db.Column(db.String(200))
    parent_id = db.Column(db.String(36),
                          db.ForeignKey('argument.id'),
                          nullable=True)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

    children = db.relationship('Argument',
                               backref=db.backref('parent', remote_side=[id]))

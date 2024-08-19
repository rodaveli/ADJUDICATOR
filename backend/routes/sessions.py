from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid

from ..models import db
from ..models.session import Session, SessionParticipant
from ..models.user import User

bp = Blueprint('sessions', __name__)

@bp.route('/create_session', methods=['POST'])
@jwt_required()
def create_session():
    data = request.json
    user_id = get_jwt_identity()
    session = Session(
        id=str(uuid.uuid4()),
        title=data['title'],
        status='open',
        creator_id=user_id
    )
    db.session.add(session)
    db.session.commit()
    return jsonify({"message": "Session created", "session_id": session.id}), 201

@bp.route('/invite_user', methods=['POST'])
@jwt_required()
def invite_user():
    data = request.json
    session = Session.query.get(data['session_id'])
    if session.creator_id != get_jwt_identity():
        return jsonify({"message": "Unauthorized"}), 403
    user = User.query.filter_by(username=data['username']).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    participant = SessionParticipant(
        id=str(uuid.uuid4()),
        session_id=data['session_id'],
        user_id=user.id
    )
    db.session.add(participant)
    db.session.commit()
    return jsonify({"message": "User invited successfully"}), 200

@bp.route('/send_email_invitation', methods=['POST'])
@jwt_required()
def send_email_invitation():
    data = request.json
    session = Session.query.get(data['session_id'])
    if session.creator_id != get_jwt_identity():
        return jsonify({"message": "Unauthorized"}), 403
    
    # Here you would implement the logic to send an email
    # This might involve using a service like SendGrid or Flask-Mail
    # For now, we'll just simulate sending an email
    
    print(f"Sending invitation email to {data['email']} for session {data['session_id']}")
    
    return jsonify({"message": "Invitation email sent successfully"}), 200

@bp.route('/get_sessions', methods=['GET'])
@jwt_required()
def get_sessions():
    user_id = get_jwt_identity()
    created_sessions = Session.query.filter_by(creator_id=user_id).all()
    participated_sessions = Session.query.join(SessionParticipant).filter(SessionParticipant.user_id == user_id).all()
    all_sessions = set(created_sessions + participated_sessions)
    return jsonify([{"id": session.id, "title": session.title} for session in all_sessions])
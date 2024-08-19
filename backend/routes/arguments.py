from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import uuid
import os

from ..models import db
from ..models.argument import Argument

bp = Blueprint('arguments', __name__)


@bp.route('/submit_argument', methods=['POST'])
@jwt_required()
def submit_argument():
    user_id = get_jwt_identity()
    session_id = request.form.get('session_id')
    content = request.form.get('content')
    parent_id = request.form.get('parent_id')

    if 'image' in request.files:
        image = request.files['image']
        if image.filename != '':
            filename = secure_filename(image.filename)
            image_path = os.path.join(current_app.config['UPLOAD_FOLDER'],
                                      filename)
            image.save(image_path)
        else:
            image_path = None
    else:
        image_path = None

    argument = Argument(id=str(uuid.uuid4()),
                        session_id=session_id,
                        user_id=user_id,
                        content=content,
                        image_path=image_path,
                        parent_id=parent_id)
    db.session.add(argument)
    db.session.commit()

    return jsonify({
        "message": "Argument submitted",
        "argument_id": argument.id
    }), 201


@bp.route('/get_arguments/<session_id>', methods=['GET'])
@jwt_required()
def get_arguments(session_id):
    arguments = Argument.query.filter_by(session_id=session_id).order_by(
        Argument.timestamp).all()
    return jsonify([{
        'id': arg.id,
        'content': arg.content,
        'image_path': arg.image_path,
        'user_id': arg.user_id,
        'parent_id': arg.parent_id,
        'timestamp': arg.timestamp.isoformat()
    } for arg in arguments])

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from pydantic import BaseModel
from openai import OpenAI
from ..models import db, Argument, Session
from .auth import get_current_user

bp = Blueprint('judgements', __name__)

class Judgement(BaseModel):
    decision: str
    reasoning: str
    confidence_score: float

client = OpenAI()

@bp.route('/get_judgement/<session_id>', methods=['GET'])
@jwt_required()
def get_judgement(session_id):
    current_user = get_current_user()
    session = Session.query.get(session_id)

    if not session:
        return jsonify({"message": "Session not found"}), 404

    arguments = Argument.query.filter_by(session_id=session_id).all()
    arguments_text = "\n".join([f"Argument by {arg.user_id}: {arg.content}" for arg in arguments])

    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",  # Make sure to use the correct model name
            messages=[
                {"role": "system", "content": "You are an impartial judge. Analyze the arguments and provide a fair judgement."},
                {"role": "user", "content": f"Here are the arguments:\n{arguments_text}\nPlease provide a judgement."}
            ],
            response_format=Judgement,
        )

        judgement = completion.choices[0].message.parsed

        # You might want to save the judgement to the database here

        return jsonify({
            "decision": judgement.decision,
            "reasoning": judgement.reasoning,
            "confidence_score": judgement.confidence_score
        }), 200
    except Exception as e:
        return jsonify({"message": "An error occurred while generating the judgement", "error": str(e)}), 500
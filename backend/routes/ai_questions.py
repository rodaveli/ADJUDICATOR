from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from pydantic import BaseModel
from openai import OpenAI
from ..models import db, AIQuestion, Session, Argument
from .auth import get_current_user

bp = Blueprint('ai_questions', __name__)


class AIQuestionSchema(BaseModel):
    question: str
    context: str
    importance: int


client = OpenAI()


@bp.route('/generate_ai_question/<session_id>', methods=['GET'])
@jwt_required()
def generate_ai_question(session_id):
    current_user = get_current_user()
    session = Session.query.get(session_id)

    if not session:
        return jsonify({"message": "Session not found"}), 404

    arguments = Argument.query.filter_by(session_id=session_id).all()
    session_data = {
        "title":
        session.title,
        "arguments": [{
            "user": arg.user_id,
            "content": arg.content
        } for arg in arguments]
    }

    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",  # Make sure to use the correct model name
            messages=[{
                "role":
                "system",
                "content":
                "You are an AI assistant tasked with generating clarifying questions for a debate or discussion."
            }, {
                "role":
                "user",
                "content":
                f"Based on this session data: {session_data}, generate a clarifying question."
            }],
            response_format=AIQuestionSchema,
        )

        ai_question = completion.choices[0].message.parsed

        # Save the AI question to the database
        new_question = AIQuestion(session_id=session_id,
                                  question=ai_question.question,
                                  status='pending')
        db.session.add(new_question)
        db.session.commit()

        return jsonify({
            "question": ai_question.question,
            "context": ai_question.context,
            "importance": ai_question.importance,
            "question_id": new_question.id
        }), 200
    except Exception as e:
        return jsonify({
            "message": "An error occurred while generating the AI question",
            "error": str(e)
        }), 500


@bp.route('/answer_ai_question', methods=['POST'])
@jwt_required()
def answer_ai_question():
    data = request.json
    question = AIQuestion.query.get(data['question_id'])
    if not question:
        return jsonify({"message": "Question not found"}), 404
    question.status = 'answered'
    db.session.commit()
    # Here you would typically pass the answer to your AI model
    return jsonify({"message": "Answer received"}), 200

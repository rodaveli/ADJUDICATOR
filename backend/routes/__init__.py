from flask import Blueprint

from . import auth, sessions, arguments, judgements, ai_questions

# Create a main blueprint for all routes
main = Blueprint('main', __name__)

# Register all route blueprints
main.register_blueprint(auth.bp)
main.register_blueprint(sessions.bp)
main.register_blueprint(arguments.bp)
main.register_blueprint(judgements.bp)
main.register_blueprint(ai_questions.bp)

# You can add any shared route handlers here if needed
@main.route('/health')
def health_check():
    return {'status': 'healthy'}, 200
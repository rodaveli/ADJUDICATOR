from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO

from .config import Config
from .models import db
from .routes import main as main_blueprint
from .services.socket_service import initialize_socketio

app = Flask(__name__, static_folder='../frontend')
app.config.from_object(Config)

db.init_app(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Register the main blueprint
app.register_blueprint(main_blueprint)

# Initialize Socket.IO
initialize_socketio(socketio)

@app.route('/')
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True)
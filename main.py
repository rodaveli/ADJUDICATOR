import sys
import os

# Add the project root and backend directories to the Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_root)
sys.path.append(os.path.join(project_root, 'backend'))

from backend.app import app, socketio

if __name__ == "__main__":
    socketio.run(app, debug=True)

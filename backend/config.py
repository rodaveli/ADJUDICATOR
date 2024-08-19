import os

class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///adjudicator.db'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')  # Change this in production
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', 'your-openai-api-key')  # Add this line
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import your models here
from .user import User
from .session import Session, SessionParticipant
from .argument import Argument
from .judgement import Judgement
from .ai_question import AIQuestion
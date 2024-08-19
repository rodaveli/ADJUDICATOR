from flask_socketio import emit, join_room, leave_room

def initialize_socketio(socketio):
    @socketio.on('join')
    def on_join(data):
        room = data['room']
        join_room(room)

    @socketio.on('leave')
    def on_leave(data):
        room = data['room']
        leave_room(room)

    @socketio.on('new_argument')
    def handle_new_argument(data):
        emit('new_argument', data, room=data['session_id'])

    @socketio.on('new_judgement')
    def handle_new_judgement(data):
        emit('new_judgement', data, room=data['session_id'])

    @socketio.on('new_ai_question')
    def handle_new_ai_question(data):
        emit('new_ai_question', data, room=data['session_id'])

    @socketio.on('ai_question_answered')
    def handle_ai_question_answered(data):
        emit('ai_question_answered', data, room=data['session_id'])
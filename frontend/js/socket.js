        // socket.js (continued)
        function leaveSession(sessionId) {
            if (socket) {
                socket.emit('leave', { room: sessionId });
            }
        }

        // Function to emit a new argument event
        function emitNewArgument(argument) {
            if (socket) {
                socket.emit('new_argument', argument);
            }
        }

        // Function to emit a new judgement event
        function emitNewJudgement(judgement) {
            if (socket) {
                socket.emit('new_judgement', judgement);
            }
        }

        // Function to emit a new AI question event
        function emitNewAIQuestion(question) {
            if (socket) {
                socket.emit('new_ai_question', question);
            }
        }

        // Function to emit an AI question answered event
        function emitAIQuestionAnswered(answer) {
            if (socket) {
                socket.emit('ai_question_answered', answer);
            }
        }

        // Error handling for socket connection
        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            showMessage('authMessage', 'Failed to connect to the server. Please try again later.', true);
        });

        socket.on('disconnect', (reason) => {
            console.log('Disconnected:', reason);
            if (reason === 'io server disconnect') {
                // the disconnection was initiated by the server, you need to reconnect manually
                socket.connect();
            }
            // else the socket will automatically try to reconnect
        });
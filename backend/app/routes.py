import uuid
from datetime import datetime
from flask import Blueprint, render_template, request, Response, jsonify, current_app, stream_with_context
from app.utils.llm import generate_roast_stream
from app.models import mongo

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/api/chat/new_chat', methods=['POST'])
def new_chat():
    """Generates a unique conversation_id and registers it in MongoDB."""
    data = request.get_json() or {}
    user_email = data.get('user_email', 'anonymous')
    celebrity_name = data.get('persona', 'The Roastmaster')
    
    conversation_id = str(uuid.uuid4())
    
    # Store conversation metadata
    mongo.db.conversations.insert_one({
        'conversation_id': conversation_id,
        'user_email': user_email,
        'celebrity_name': celebrity_name,
        'timestamp': datetime.utcnow()
    })
    
    return jsonify({'conversation_id': conversation_id}), 201


@main.route('/api/chat/history', methods=['POST'])
def chat_history():
    """
    Returns the most recent conversation (and last N messages)
    for a given user + celebrity persona.
    Expects JSON: { "user_email": "...", "persona": "...", "limit": 10 }
    """
    data = request.get_json() or {}
    user_email = data.get('user_email')
    persona = data.get('persona')
    limit = int(data.get('limit', 10))

    if not user_email or not persona:
        return jsonify({'error': 'user_email and persona are required'}), 400

    # Find the latest conversation for this user + persona
    conv = mongo.db.conversations.find_one(
        {'user_email': user_email, 'celebrity_name': persona},
        sort=[('timestamp', -1)]
    )

    if not conv:
        return jsonify({'messages': [], 'conversation_id': None}), 200

    conversation_id = conv.get('conversation_id')

    # Fetch last N messages for that conversation
    past_msgs = list(
        mongo.db.messages.find({'conversation_id': conversation_id})
        .sort('timestamp', -1)
        .limit(limit)
    )
    past_msgs.reverse()

    messages = [
        {
            'role': msg.get('role'),
            'content': msg.get('content', ''),
            'persona_id': msg.get('persona_id'),
        }
        for msg in past_msgs
    ]

    return jsonify({'conversation_id': conversation_id, 'messages': messages}), 200

@main.route('/api/chat/stream', methods=['POST'])
def chat_stream():
    """
    Endpoint for streaming the Groq LLM response using Server-Sent Events (SSE).
    Expects JSON: { "message": "user input", "persona": "celebrity name", "conversation_id": "uuid" }
    """
    data = request.get_json()
    if not data or not data.get('message'):
        return jsonify({'error': 'Message is required'}), 400
        
    user_message = data.get('message')
    persona = data.get('persona', 'The Roastmaster')
    if not persona:
        persona = 'The Roastmaster'
    mode = data.get('mode', 'savage')
    conversation_id = data.get('conversation_id')
    used_angles = data.get('used_angles', [])
    valid_modes = ['gentle', 'savage', 'twitter', 'hollywood']
    if mode not in valid_modes:
        mode = 'savage'
        
    # --- Context Pruning (fetch last 10 messages from DB) ---
    history = []
    if conversation_id:
        # Fetch last 10 messages, sorted chronological by timestamp
        past_msgs = list(mongo.db.messages.find(
            {'conversation_id': conversation_id}
        ).sort('timestamp', -1).limit(10))
        
        # Reverse to get chronological order for the prompt
        past_msgs.reverse()
        
        for msg in past_msgs:
            history.append({
                "role": msg.get("role"),
                "content": msg.get("content")
            })
            
        # Save the current user message to MongoDB
        mongo.db.messages.insert_one({
            'conversation_id': conversation_id,
            'persona_id': persona,
            'role': 'user',
            'content': user_message,
            'timestamp': datetime.utcnow()
        })
    
    api_key = current_app.config.get('GROQ_API_KEY')
    return Response(
        stream_with_context(generate_roast_stream(user_message, persona, api_key, mode, history, used_angles, conversation_id)),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no' # Prevents Nginx/proxy buffering
        }
    )

const BACKEND_URL = 'http://127.0.0.1:5000';

/**
 * Streams a roast response from the Flask backend using SSE.
 * Calls onChunk(text) for each text chunk.
 * Calls onAngleUsed(angle) when the server emits an angle_used event.
 * Calls onDone(footerText) when the stream ends.
 */
export async function startNewChat(userEmail, persona) {
  const res = await fetch(`${BACKEND_URL}/api/chat/new_chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_email: userEmail, persona }),
  });
  return res.json();
}

export async function fetchChatHistory(userEmail, persona, limit = 10) {
  const res = await fetch(`${BACKEND_URL}/api/chat/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_email: userEmail, persona, limit }),
  });
  return res.json();
}

export async function clearChat(conversationId) {
  const res = await fetch(`${BACKEND_URL}/api/chat/clear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversation_id: conversationId }),
  });
  return res.json();
}

export async function streamRoast({ message, persona, mode, history, usedAngles, conversationId, onChunk, onAngleUsed, onDone, onError }) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        persona,
        mode,
        history,
        used_angles: usedAngles,
        conversation_id: conversationId,
      }),
    });

    if (!response.ok) {
      onError(`Server error: ${response.status}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let nextIsAngle = false;
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        if (line.startsWith('event: angle_used')) {
          nextIsAngle = true;
        } else if (line.startsWith('data: ')) {
          const content = line.slice(6);
          if (nextIsAngle) {
            onAngleUsed && onAngleUsed(content.trim());
            nextIsAngle = false;
          } else {
            try {
              const parsed = JSON.parse(content);
              if (parsed && typeof parsed.text === 'string') {
                fullText += parsed.text;
                onChunk && onChunk(parsed.text);
              }
            } catch (err) {
              // ignore invalid JSON chunks
            }
          }
        }
      }
    }

    onDone && onDone(fullText);
  } catch (err) {
    onError && onError(err.message);
  }
}

/**
 * Auth API calls — matches Flask /api/auth blueprint
 */
export async function signupUser(email, password) {
  const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function sendOtp(email) {
  const res = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function verifyOtp(email, otp) {
  const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  return res.json();
}

import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_mongo_chat():
    print("1. Creating new chat session...")
    res = requests.post(f"{BASE_URL}/api/chat/new_chat", json={
        "user_email": "test@roastify.com",
        "persona": "Gordon Ramsay"
    })
    
    if res.status_code != 201:
        print(f"Failed to create chat: {res.text}")
        return
        
    data = res.json()
    conv_id = data.get("conversation_id")
    print(f"  -> Session created: {conv_id}")
    
    print("\n2. Sending first message (saving to DB)...")
    payload1 = {
        "message": "I like microwave dinners.",
        "persona": "Gordon Ramsay",
        "mode": "savage",
        "conversation_id": conv_id
    }
    
    with requests.post(f"{BASE_URL}/api/chat/stream", json=payload1, stream=True) as response:
        print("  -> AI Response: ", end="")
        for line in response.iter_lines():
            if line:
                decoded = line.decode('utf-8')
                if decoded.startswith('data: '):
                    try:
                        content = json.loads(decoded[6:]).get("text", "")
                        print(content, end="", flush=True)
                    except:
                        pass
        print("\n")
        
    print("\n3. Sending second message (should remember the first)...")
    payload2 = {
        "message": "Why are you so mad about my last message?",
        "persona": "Gordon Ramsay",
        "mode": "savage",
        "conversation_id": conv_id
    }
    
    with requests.post(f"{BASE_URL}/api/chat/stream", json=payload2, stream=True) as response:
        print("  -> AI Response: ", end="")
        for line in response.iter_lines():
            if line:
                decoded = line.decode('utf-8')
                if decoded.startswith('data: '):
                    try:
                        content = json.loads(decoded[6:]).get("text", "")
                        print(content, end="", flush=True)
                    except:
                        pass
        print("\n")

if __name__ == "__main__":
    test_mongo_chat()

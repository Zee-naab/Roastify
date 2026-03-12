import requests

def interactive_chat():
    url = "http://127.0.0.1:5000/api/chat/stream"
    
    print("=====================================================")
    print("🔥 THE ROASTMASTER INTERACTIVE TERMINAL 🔥")
    print("=====================================================")
    print("\nAVAILABLE CELEBRITIES:")
    print("Gordon Ramsay, Elon Musk, Kanye West, Kim Kardashian, ")
    print("Tom Cruise, Taylor Swift, Mark Zuckerberg, Will Smith, ")
    print("Jeff Bezos, Cristiano Ronaldo, Drake, Nicki Minaj, ")
    print("Richard Pryor, George Carlin, Kevin Hart")
    print("\nType 'quit' or 'exit' to stop.")
    
    # Let the user choose a persona and mode at the start
    persona = input("\nChoose a celebrity persona (default: George Carlin): ").strip()
    if not persona:
        persona = "George Carlin"
        
    mode = input("Choose a mode [gentle, savage, twitter, hollywood] (default: savage): ").strip().lower()
    if mode not in ['gentle', 'savage', 'twitter', 'hollywood']:
        mode = "savage"
    
    print(f"\n[ System ]: Persona set to '{persona}' in '{mode}' mode. Memory ENABLED.")
    print("-" * 50)
    
    conversation_history = []
    used_angles = []
    
    while True:
        try:
            # Get user input
            user_msg = input("\nYou: ").strip()
            
            if not user_msg:
                continue
                
            if user_msg.lower() in ['quit', 'exit']:
                print("Coward. See you later! 👋")
                break
                
            payload = {
                "message": user_msg,
                "persona": persona,
                "mode": mode,
                "history": conversation_history,
                "used_angles": used_angles
            }
            
            print(f"\n{persona}: ", end="", flush=True)
            
            full_response = ""
            
            # Send the request and stream the response
            with requests.post(url, json=payload, stream=True) as response:
                if response.status_code != 200:
                    print(f"\n[Error: Server returned {response.status_code}]")
                    continue

                for line in response.iter_lines():
                    if line:
                        decoded_line = line.decode('utf-8')
                        # Check for the special angle_used metadata event
                        if decoded_line.startswith('event: angle_used'):
                            continue  # skip the event label
                        elif decoded_line.startswith('data: '):
                            content = decoded_line[6:]
                            # Check if it's an angle tracking update (hidden from user display)
                            if decoded_line.startswith('data: ') and len(content) < 80 and 'Burn Level' not in decoded_line:
                                # Could be angle metadata — track it silently if short
                                # We detect it by checking if it's a known angle from our celebrity list
                                possible_angle = content.strip()
                                if possible_angle and not possible_angle.startswith('\n') and not possible_angle.startswith('[Error'):
                                    # Only track if it looks like a short angle label, not content
                                    if possible_angle in [a for cel in __import__('app.utils.llm', fromlist=['CELEBRITY_DATA']).CELEBRITY_DATA.values() for a in cel.get('angles', [])]:
                                        if possible_angle not in used_angles:
                                            used_angles.append(possible_angle)
                                        continue  # Don't print the angle metadata
                            content = content.replace('\\n', '\n')
                            print(content, end='', flush=True)
                            full_response += content
            print("\n")
            print("-" * 50)
            
            # Save to conversation history to simulate memory (limit to last 10 messages so we don't blow up the API context)
            conversation_history.append({"role": "user", "content": user_msg})
            conversation_history.append({"role": "assistant", "content": full_response})
            if len(conversation_history) > 10:
                conversation_history = conversation_history[-10:]
            
        except KeyboardInterrupt:
            print("\nCoward. See you later! 👋")
            break
        except requests.exceptions.ConnectionError:
            print("\n[Error: Could not connect to the server. Is the Flask app running?]")
            break
        except Exception as e:
            print(f"\n[Error occurred: {e}]")

if __name__ == "__main__":
    interactive_chat()

import json
import sys
import time

import requests

# ── Config ─────────────────────────────────────────────────────────────────
BACKEND_URL = "http://127.0.0.1:5000"
STREAM_URL = f"{BACKEND_URL}/api/chat/stream"
NEW_CHAT_URL = f"{BACKEND_URL}/api/chat/new_chat"

CELEBRITIES = [
    "gordon ramsay",
    "elon musk",
    "kanye west",
    "kim kardashian",
    "will smith",
    "jeff bezos",
    "drake",
    "nicki minaj",
    "richard pryor",
    "george carlin",
    "kevin hart",
    "abhishek upmanyu",
    "tabish hashmi",
    "umer sharif",
    "anubhav singh bassi",
]

MODES = ["gentle", "savage", "twitter", "hollywood"]

# The single prompt used for every batch test cell
BATCH_PROMPT = "I just ate cereal with water instead of milk."

# ── Colours (ANSI) ─────────────────────────────────────────────────────────
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"


# ── Core streamer ───────────────────────────────────────────────────────────
def stream_roast(
    persona,
    mode,
    message,
    history=None,
    used_angles=None,
    conversation_id=None,
    print_live=False,
):
    """
    Hit /api/chat/stream, collect chunks, return (full_text, angles_used).
    If print_live=True, print each text chunk to stdout as it arrives.
    """
    payload = {
        "message": message,
        "persona": persona,
        "mode": mode,
        "history": history or [],
        "used_angles": used_angles or [],
        "conversation_id": conversation_id,
    }

    full_text = ""
    angles_used = []
    next_is_angle = False

    try:
        with requests.post(STREAM_URL, json=payload, stream=True, timeout=60) as resp:
            if resp.status_code != 200:
                err = f"[HTTP {resp.status_code}]"
                if print_live:
                    print(err, flush=True)
                return err, []

            for raw_line in resp.iter_lines():
                if not raw_line:
                    continue

                line = raw_line.decode("utf-8")

                # ── SSE event marker
                if line.startswith("event: angle_used"):
                    next_is_angle = True
                    continue

                # ── SSE data line
                if line.startswith("data: "):
                    payload_str = line[6:]

                    # Angle metadata
                    if next_is_angle:
                        angles_used.append(payload_str.strip())
                        next_is_angle = False
                        continue

                    # Regular text chunk — parse JSON and extract "text"
                    try:
                        chunk = json.loads(payload_str).get("text", "")
                    except (json.JSONDecodeError, AttributeError):
                        chunk = payload_str  # fallback: print as-is

                    full_text += chunk

                    if print_live:
                        print(chunk, end="", flush=True)

    except requests.exceptions.ConnectionError:
        err = "[Error: Cannot connect — is Flask running?]"
        if print_live:
            print(err)
        return err, []

    except Exception as exc:
        err = f"[Error: {exc}]"
        if print_live:
            print(err)
        return err, []

    return full_text.strip(), angles_used


# ── Batch test ──────────────────────────────────────────────────────────────
def run_batch_test():
    total = len(CELEBRITIES) * len(MODES)
    passed = 0
    failed = 0
    results = []

    print(f"\n{BOLD}{'=' * 70}{RESET}")
    print(
        f"{BOLD}🔥  ROASTIFY BATCH TEST  —  {len(CELEBRITIES)} Celebrities × {len(MODES)} Modes = {total} Tests{RESET}"
    )
    print(f"{BOLD}{'=' * 70}{RESET}")
    print(f'{DIM}Prompt: "{BATCH_PROMPT}"{RESET}\n')

    for celeb in CELEBRITIES:
        for mode in MODES:
            label = f"{celeb.title()}"
            print(f"  {CYAN}▶{RESET}  {label:<26} [{mode:<10}]  ", end="", flush=True)

            t_start = time.time()
            response, angles = stream_roast(celeb, mode, BATCH_PROMPT)
            elapsed = time.time() - t_start

            is_error = response.startswith("[Error") or response.startswith("[HTTP")

            if is_error:
                status = f"{RED}❌ FAIL{RESET}"
                failed += 1
            else:
                status = f"{GREEN}✅ PASS{RESET}"
                passed += 1

            print(f"{status}  {DIM}({elapsed:.1f}s){RESET}")
            results.append((celeb, mode, is_error, response, elapsed, angles))

    # ── Summary bar
    print(f"\n{BOLD}{'=' * 70}{RESET}")
    colour = GREEN if failed == 0 else (YELLOW if failed < total // 2 else RED)
    print(
        f"{BOLD}  Results: {colour}{passed} passed{RESET}{BOLD}  |  "
        f"{RED}{failed} failed{RESET}{BOLD}  |  {total} total{RESET}"
    )
    print(f"{BOLD}{'=' * 70}{RESET}")

    # ── Optional: print full responses
    show = input(f"\n{BOLD}Print full responses?{RESET} [y/N]: ").strip().lower()
    if show == "y":
        # Optional filter
        filter_celeb = (
            input("Filter by celebrity (leave blank for all): ").strip().lower()
        )
        filter_mode = input("Filter by mode (leave blank for all): ").strip().lower()

        for celeb, mode, is_error, response, elapsed, angles in results:
            if filter_celeb and filter_celeb not in celeb:
                continue
            if filter_mode and filter_mode != mode:
                continue

            status_icon = "❌" if is_error else "✅"
            print(f"\n{'─' * 70}")
            print(
                f"{BOLD}{status_icon}  {celeb.title():<26} [{mode}]  {DIM}({elapsed:.1f}s){RESET}"
            )
            if angles:
                print(f"{DIM}  Angle used: {', '.join(angles)}{RESET}")
            print(f"{'─' * 70}")
            print(response if response else f"{DIM}(empty response){RESET}")

    print()


# ── Interactive chat ─────────────────────────────────────────────────────────
def run_interactive():
    print(f"\n{BOLD}{'=' * 60}{RESET}")
    print(f"{BOLD}🔥  ROASTIFY INTERACTIVE TERMINAL{RESET}")
    print(f"{BOLD}{'=' * 60}{RESET}")
    print(f"{DIM}Celebrities: {', '.join(c.title() for c in CELEBRITIES)}{RESET}")
    print(f"{DIM}Type 'quit' or 'exit' to stop.{RESET}\n")

    raw_persona = input(f"{BOLD}Celebrity{RESET} (default: Gordon Ramsay): ").strip()
    persona = raw_persona if raw_persona else "gordon ramsay"

    raw_mode = (
        input(
            f"{BOLD}Mode{RESET} [gentle / savage / twitter / hollywood] (default: savage): "
        )
        .strip()
        .lower()
    )
    mode = raw_mode if raw_mode in MODES else "savage"

    print(f"\n{BOLD}[ {persona.title()} | {mode} mode ]{RESET}")
    print("─" * 60)
    print(
        f"{DIM}Commands: /mode <mode>  /celeb <name>  /clear  /status  /help  quit{RESET}"
    )
    print("─" * 60)

    conversation_history = []
    used_angles = []

    while True:
        try:
            user_msg = input(f"\n{BOLD}You:{RESET} ").strip()

            if not user_msg:
                continue

            if user_msg.lower() in ("quit", "exit"):
                print("Coward. See you later! 👋")
                break

            # ── Slash commands ──────────────────────────────────────────
            if user_msg.startswith("/"):
                parts = user_msg[1:].strip().split(maxsplit=1)
                cmd = parts[0].lower()
                arg = parts[1].strip().lower() if len(parts) > 1 else ""

                if cmd == "help":
                    print(f"\n{BOLD}Available commands:{RESET}")
                    print(f"  {CYAN}/mode <mode>{RESET}   — switch roast mode mid-chat")
                    print(f"               modes: {', '.join(MODES)}")
                    print(f"  {CYAN}/celeb <name>{RESET}  — switch celebrity mid-chat")
                    print(
                        f"               celebs: {', '.join(c.title() for c in CELEBRITIES)}"
                    )
                    print(f"  {CYAN}/clear{RESET}         — wipe conversation history")
                    print(
                        f"  {CYAN}/status{RESET}        — show current celebrity, mode & history length"
                    )
                    print(f"  {CYAN}/help{RESET}          — show this list")
                    print(f"  {CYAN}quit / exit{RESET}    — leave\n")

                elif cmd == "mode":
                    if not arg:
                        print(f"\n{YELLOW}Current mode: {BOLD}{mode}{RESET}")
                        print(f"{DIM}Available: {', '.join(MODES)}{RESET}")
                        print(f"Usage: /mode <{'|'.join(MODES)}>\n")
                    elif arg in MODES:
                        old_mode = mode
                        mode = arg
                        print(
                            f"\n{GREEN}✅ Mode switched: {BOLD}{old_mode}{RESET}{GREEN} → {BOLD}{mode}{RESET}\n"
                        )
                        print(f"{BOLD}[ {persona.title()} | {mode} mode ]{RESET}")
                        print("─" * 60)
                    else:
                        print(
                            f"\n{RED}❌ Unknown mode '{arg}'. Choose from: {', '.join(MODES)}{RESET}\n"
                        )

                elif cmd == "celeb":
                    if not arg:
                        print(
                            f"\n{YELLOW}Current celebrity: {BOLD}{persona.title()}{RESET}"
                        )
                        print(
                            f"{DIM}Available: {', '.join(c.title() for c in CELEBRITIES)}{RESET}"
                        )
                        print(f"Usage: /celeb <name>\n")
                    else:
                        # fuzzy match — check if arg is a substring of any celeb key
                        match = next(
                            (c for c in CELEBRITIES if arg in c or c in arg), None
                        )
                        if match:
                            old_persona = persona
                            persona = match
                            used_angles = []  # reset angles for new celeb
                            print(
                                f"\n{GREEN}✅ Celebrity switched: {BOLD}{old_persona.title()}{RESET}{GREEN} → {BOLD}{persona.title()}{RESET}"
                            )
                            print(
                                f"{DIM}(Angle history reset for new celebrity){RESET}\n"
                            )
                            print(f"{BOLD}[ {persona.title()} | {mode} mode ]{RESET}")
                            print("─" * 60)
                        else:
                            print(f"\n{RED}❌ No celebrity matched '{arg}'.{RESET}")
                            print(
                                f"{DIM}Try: {', '.join(c.title() for c in CELEBRITIES)}{RESET}\n"
                            )

                elif cmd == "clear":
                    conversation_history.clear()
                    used_angles.clear()
                    print(
                        f"\n{GREEN}✅ Conversation history cleared. Fresh start!{RESET}\n"
                    )

                elif cmd == "status":
                    print(
                        f"\n{BOLD}┌─ Session Status ───────────────────────────{RESET}"
                    )
                    print(
                        f"{BOLD}│{RESET}  Celebrity  : {CYAN}{persona.title()}{RESET}"
                    )
                    print(f"{BOLD}│{RESET}  Mode       : {CYAN}{mode}{RESET}")
                    print(
                        f"{BOLD}│{RESET}  History    : {len(conversation_history)} messages"
                    )
                    print(f"{BOLD}│{RESET}  Angles used: {len(used_angles)}")
                    if used_angles:
                        print(f"{BOLD}│{RESET}  {DIM}{', '.join(used_angles)}{RESET}")
                    print(
                        f"{BOLD}└────────────────────────────────────────────{RESET}\n"
                    )

                else:
                    print(
                        f"\n{RED}❌ Unknown command '/{cmd}'. Type /help for a list.{RESET}\n"
                    )

                continue  # don't send slash commands to the LLM
            # ── End slash commands ──────────────────────────────────────

            print(f"\n{BOLD}{CYAN}{persona.title()}:{RESET} ", end="", flush=True)

            full_response, new_angles = stream_roast(
                persona=persona,
                mode=mode,
                message=user_msg,
                history=conversation_history,
                used_angles=used_angles,
                print_live=True,
            )

            print(f"\n{DIM}{'─' * 60}{RESET}")

            # Track angles
            used_angles.extend(new_angles)
            used_angles = used_angles[-10:]

            # Build memory
            conversation_history.append({"role": "user", "content": user_msg})
            conversation_history.append({"role": "assistant", "content": full_response})
            if len(conversation_history) > 20:
                conversation_history = conversation_history[-20:]

        except KeyboardInterrupt:
            print("\nCoward. See you later! 👋")
            break

        except requests.exceptions.ConnectionError:
            print("\n[Error: Lost connection to server.]")
            break


# ── Entry point ─────────────────────────────────────────────────────────────
def main():
    print(f"\n{BOLD}🔥  ROASTIFY TEST SUITE{RESET}")
    print(f"{'─' * 40}")
    print("  1.  Batch test  — all 15 celebrities × 4 modes")
    print("  2.  Interactive — pick one celebrity and chat")
    print(f"{'─' * 40}")

    choice = input(f"\n{BOLD}Choose [1/2]:{RESET} ").strip()

    if choice == "1":
        run_batch_test()
    elif choice == "2":
        run_interactive()
    else:
        print("Invalid choice. Running interactive mode by default.")
        run_interactive()


if __name__ == "__main__":
    main()

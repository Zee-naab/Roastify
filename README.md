<div align="center">

# 🎤 Roastify

### Get roasted by your favourite celebrity — powered by AI.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=flat-square&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3-F55036?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)

</div>

---

## 📖 Overview

**Roastify** is a full-stack AI-powered roast chatbot where users can pick from **15 celebrity personas** and get savagely (or gently) roasted in real time. Each celebrity has a custom personality, unique speech pattern, and a set of rotating joke angles — so no two conversations are the same.

Responses stream word-by-word using **Server-Sent Events**, just like watching a comedian perform live on stage.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎭 **15 Celebrity Personas** | Gordon Ramsay, Elon Musk, Kanye West, Drake, Taylor Swift, and 10 more |
| 🔥 **4 Roast Modes** | Gentle · Savage · Twitter (one-liner) · Hollywood insider |
| ⚡ **Live Streaming** | Word-by-word SSE streaming — no waiting for the full response |
| 🧠 **Joke Memory** | Tracks used angles per session to prevent repeated jokes |
| 💬 **Chat History** | Conversations saved per celebrity and restored on return |
| 🔐 **Auth System** | Email + password signup with OTP email verification |
| 🗄️ **Smart DB Pruning** | Only the last 10 messages per conversation are kept |
| 📱 **Responsive UI** | Dark glassmorphism design with Framer Motion animations |

---

## 🛠️ Tech Stack

### Backend
- **Flask 3.1** — REST API + SSE streaming
- **MongoDB** (via Flask-PyMongo) — users, conversations, messages, OTPs
- **Groq API** — LLaMA 3.3 70B Versatile for LLM responses
- **bcrypt** — password hashing
- **PyJWT** — JSON Web Token auth
- **Flask-Mail** — OTP email delivery

### Frontend
- **React 19** + **Vite 8**
- **React Router v7** — client-side routing with protected routes
- **Tailwind CSS** — custom dark design system
- **Framer Motion** — page and component animations
- **Lucide React** — icons

---

## 📁 Project Structure

```
Roastify/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # App factory (Flask, PyMongo, Mail, CORS)
│   │   ├── auth.py              # Auth blueprint (/api/auth)
│   │   ├── models.py            # MongoDB helpers + prune_messages()
│   │   ├── routes.py            # Chat blueprint (/api/chat)
│   │   └── utils/
│   │       ├── email.py         # OTP email sender
│   │       └── llm.py           # Groq streaming + celebrity data packs
│   ├── config.py                # Config from .env
│   ├── run.py                   # Entry point
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/
        │   └── chat.js          # All fetch/SSE calls to the backend
        ├── components/
        │   ├── CelebrityGrid.jsx
        │   ├── ChatWindow.jsx
        │   └── ModeSelector.jsx
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── AuthPage.jsx
        │   └── ChatPage.jsx
        └── App.jsx              # Routes + auth guards
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (free tier works)
- A [Groq API key](https://console.groq.com/) (free)
- A Gmail account (or any SMTP) for sending OTP emails

---

### 1. Clone the repo

```bash
git clone https://github.com/Zee-naab/Roastify.git
cd Roastify
```

---

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt
pip install groq              # LLM client
```

#### Create `backend/.env`

```env
SECRET_KEY=your-secret-key-here

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/roastify

# Groq
GROQ_API_KEY=your-groq-api-key-here

# Email (Gmail example)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your@gmail.com
SMTP_PASSWORD=your-app-password
SENDER_EMAIL=your@gmail.com
```

> **Gmail tip:** Use an [App Password](https://myaccount.google.com/apppasswords) instead of your real password (requires 2FA enabled).

#### Run the backend

```bash
python run.py
```

The API will be live at `http://127.0.0.1:5000`.

---

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be live at `http://localhost:5173`.

---

## 🔌 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Create account + send OTP |
| POST | `/verify-otp` | Verify OTP → returns JWT |
| POST | `/login` | Email + password → returns JWT |
| POST | `/send-otp` | Resend OTP to email |

### Chat — `/api/chat`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/new_chat` | Create a new conversation ID |
| POST | `/history` | Fetch last N messages for a user + persona |
| POST | `/stream` | Stream AI roast response via SSE |

---

## 🎭 Celebrity Roster

| Celebrity | Roast Style |
|---|---|
| 👨‍🍳 Gordon Ramsay | Explosive anger, screams in ALL CAPS |
| 🚀 Elon Musk | Dry tech-bro sarcasm |
| 🎤 Kanye West | Overconfident genius rants |
| 💅 Kim Kardashian | Calm influencer shade |
| 🎬 Tom Cruise | Intense action-hero motivation |
| 🎶 Taylor Swift | Lyrical, poetic storytelling burns |
| 🤖 Mark Zuckerberg | Flat, robotic, accidentally creepy |
| 🌟 Will Smith | Hype-man energy while destroying you |
| 📦 Jeff Bezos | Cold corporate-villain sarcasm |
| ⚽ Cristiano Ronaldo | Arrogant SIUUU supremacy |
| 🦉 Drake | Melodramatic sad-rapper shade |
| 👑 Nicki Minaj | Queen addressing peasants |
| 🎭 Richard Pryor | Raw honest storytelling |
| 💭 George Carlin | Cynical philosophical rants |
| 😂 Kevin Hart | Loud, fast, exaggerated panic stories |

---

## 🔒 Environment & Security Notes

- `.env` is git-ignored — **never commit secrets**
- Passwords are hashed with **bcrypt** before storage
- JWTs expire after **7 days**
- OTPs expire after **5 minutes** and are deleted on use
- Each conversation is pruned to the **last 10 messages** automatically

---

## 📄 License

This project is private. All rights reserved © 2025 Roastify.

---

<div align="center">
  Built with 🔥 · Powered by <a href="https://groq.com">Groq LLaMA 3</a> · Deployed on your machine
</div>
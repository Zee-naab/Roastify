import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
# Load env vars from the backend folder
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess-roastify'
    MONGO_URI = os.environ.get('MONGO_URI')
    
    # Groq API
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
    # Flask-Mail settings
    MAIL_SERVER = os.environ.get('SMTP_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('SMTP_PORT') or 587)
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('SMTP_USERNAME')
    MAIL_PASSWORD = os.environ.get('SMTP_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('SENDER_EMAIL')
    SENDER_EMAIL = os.environ.get('SENDER_EMAIL')

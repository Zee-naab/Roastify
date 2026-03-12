from flask import Flask
from config import Config
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_mail import Mail

mongo = PyMongo()
mail = Mail()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    CORS(app)
    mail.init_app(app)
    
    # only init mongo if URI is set
    if app.config.get('MONGO_URI'):
        mongo.init_app(app)

    # Register blueprints or routes here
    from app.routes import main
    from app.auth import auth_bp
    app.register_blueprint(main)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    # Initialize indexes after DB connection is ready
    with app.app_context():
        from app.models import setup_indexes
        setup_indexes()

    return app

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config')  # Update with your actual config
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///funda_time_tracker.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'my_secret_key')
    app.config['DEBUG'] = True

    db.init_app(app)

    # Import and register your CLI commands here
    from commands.delete_flagged_users import delete_flagged_users
    app.cli.add_command(delete_flagged_users)

    return app

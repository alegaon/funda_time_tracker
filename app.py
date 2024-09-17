import logging
from flask_cors import CORS
from commands.delete_flagged_users import delete_flagged_users
from factory import create_app
from flask_session import Session
from models import db

logging.basicConfig(level=logging.INFO)  # Set logging level to INFO or DEBUG

# Create the app using the factory function
app = create_app()

# Configure session and CORS after app creation
app.config['SECRET_KEY'] = 'your_secret_key'  # Replace with a strong secret key
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
session = Session(app)

CORS(app)

# Import routes after the app and db are initialized
with app.app_context():
    from routes import *
    db.create_all()

# Register the management command
app.cli.add_command(delete_flagged_users)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

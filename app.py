from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS


# Initialize the Flask app
app = Flask(__name__)

# Configure the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///example.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['SECRET_KEY'] = 'your_secret_key'  # Replace with a strong secret key
app.config['SESSION_TYPE'] = 'filesystem'

# Initialize the database
db = SQLAlchemy(app)

# Enable CORS
CORS(app)


# Import routes after the app and db are initialized
from routes import *
from models import *


with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)

import os


SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///funda_time_tracker.db')
SQLALCHEMY_TRACK_MODIFICATIONS = False
SECRET_KEY = os.getenv('SECRET_KEY', 'my_secret_key')
DEBUG = True
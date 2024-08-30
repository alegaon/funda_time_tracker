from flask import jsonify, request
from app import app, db
from models import User, Shift
import logging
from datetime import datetime


# create a route to create a user
@app.route('/user', methods=['POST'])
def create_user():
    if not request.is_json:
        return jsonify({'message': 'Request is not JSON'}), 400
    username = request.json.get('username')
    email = request.json.get('email')
    password = request.json.get('password')
    user = User(username=username, email=email, password=password)
    db.session.add(user)
    db.session.commit()
    logging.info(f'User {username} created successfully')
    return jsonify({'message': 'User created successfully!'})

@app.route('/user/<username>/', methods=['GET'])
def get_user(username):
    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({'message': 'User not found'}), 404
    return jsonify({'username': user.username, 'email': user.email})

@app.route('/shift', methods=['POST'])
def create_shift():
    if not request.is_json:
        return jsonify({'message': 'Request is not JSON'}), 400
    
    username = request.json.get('username')
    date_str = request.json.get('date')
    start_time_str = request.json.get('start_time')
    end_time_str = request.json.get('end_time')
    
    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
        start_time = datetime.strptime(start_time_str, '%H:%M').time()
        end_time = datetime.strptime(end_time_str, '%H:%M').time()
    except ValueError:
        return jsonify({'message': 'Invalid date format, should be YYYY-MM-DD'}), 400

    shift = Shift(username=username, date=date, start_time=start_time, end_time=end_time)
    db.session.add(shift)
    db.session.commit()
    
    logging.info(f'Shift {username} created successfully')
    return jsonify({'message': 'Shift created successfully!'})

# create a shift route to get all shifts for a user
@app.route('/shift/<username>/', methods=['GET'])
def get_shifts(username):
    shifts = Shift.query.filter_by(username=username).all()
    if not shifts:
        return jsonify({'message': 'Shifts not found'}), 404
    return jsonify([{'date': shift.date, 'start_time': shift.start_time, 'end_time': shift.end_time} for shift in shifts])

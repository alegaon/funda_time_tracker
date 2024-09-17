from flask import jsonify, request, send_from_directory, session
from app import app, db
from models import User, Shift
import logging, os, jwt
from datetime import datetime, timedelta
from jwt import ExpiredSignatureError, InvalidTokenError
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt(app)
SECRET_KEY = app.config['SECRET_KEY']

@app.route('/user', methods=['POST'])
def create_user():
    if not request.is_json:
        return jsonify({'message': 'Request is not JSON'}), 400
    username = request.json.get('username')
    email = request.json.get('email')
    password = request.json.get('password')
    password = bcrypt.generate_password_hash(password)
    user = User(username=username, email=email, password=password)
    db.session.add(user)
    db.session.commit()
    logging.info(f'User {username} created successfully')
    return jsonify({'message': 'User created successfully!'})


@app.route('/user/<username>/', methods=['GET'])
def get_user(username):
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'message': 'Token is missing'}), 401
    
    token = auth_header.split(" ")[1]  # Extract token from auth_header
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401
    
    user = User.query.filter_by(username=username).first()
    shifts = Shift.query.filter_by(user_id=user.id).all()
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify({
        'username': user.username,
        'email': user.email,
        'shifts': [{
            'date': shift.date.strftime('%Y-%m-%d'),
            'start_time': shift.start_time.strftime('%H:%M:%S'),
            'end_time': shift.end_time.strftime('%H:%M:%S')
        } for shift in shifts]
    })


@app.route('/users/user_id/<int:id>', methods=['DELETE'])
def delete_user(id):
    # Validate token
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'message': 'Token is missing'}), 401
    
    token = auth_header.split(" ")[1]  # Extract token from auth_header
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401

    user = User.query.filter_by(id=id).first()

    # Check if user exists
    if user is None:
        return jsonify({'message': 'User not found'}), 404
    
    # Add user to list of flagged FOR_DELETION users
    user.for_deletion = True
    db.session.commit()
    return jsonify({'message': 'User flagged for deletion'}), 200


@app.route('/shift', methods=['POST'])
def create_shift():
    if not request.is_json:
        return jsonify({'message': 'Request is not JSON'}), 400

    username = request.json.get('username')
    date_str = request.json.get('date')
    start_time_str = request.json.get('start_time')
    end_time_str = request.json.get('end_time')

    user = User.query.filter_by(username=username).first()

    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
        start_time = datetime.strptime(start_time_str, '%H:%M').time()
        end_time = datetime.strptime(end_time_str, '%H:%M').time()
    except ValueError:
        return jsonify(
            {'message': 'Invalid date format, should be YYYY-MM-DD'}), 400

    shift = Shift(
        user_id=user.id,
        user=user,
        date=date,
        start_time=start_time,
        end_time=end_time
    )

    db.session.add(shift)
    db.session.commit()

    logging.info(f'Shift {username} created successfully')
    return jsonify({'message': 'Shift created successfully!'})


@app.route('/shift/<username>/', methods=['GET'])
def get_shifts(username):
    shifts = Shift.query.filter_by(username=username).all()
    if not shifts:
        return jsonify({'message': 'Shifts not found'}), 404
    return jsonify([{
        'date': shift.date,
        'start_time': shift.start_time,
        'end_time': shift.end_time} for shift in shifts])


# create a breakshift route to create breaks for a specific shift
@app.route('/break', methods=['POST'])
def create_break():
    if auth_header := request.headers.get('Authorization'):
        token = auth_header.split(" ")[1]
    
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401

    if not request.is_json:
        return jsonify({'message': 'Request is not JSON'}), 400

    username = request.json.get('username')
    user = User.query.filter_by(username=username).first()

    break_shift = request.json.get('break_shift')

    # measure break in minutes
    break_minutes = request.json.get('break_minutes')

    break_minutes = break_minutes if break_minutes is not None else 0

    # automatically set break start time.
    break_start_time = datetime.now().time()

    # calculate break end time
    break_end_time = (
        datetime.combine(
            datetime.now(),
            break_start_time) + timedelta(minutes=break_minutes)).time()


    # create breakshift
    break_shift = Shift(
        user_id=user.id,
        user=user,
        date=datetime.now().date(),
        start_time=break_start_time,
        end_time=break_end_time,
        break_shift=break_shift
    )

    db.session.add(break_shift)
    db.session.commit()

    logging.info(f'Break shift {username} created successfully')
    return jsonify({'message': 'Break shift created successfully!'})


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'Request is not JSON'}), 400

    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({'message': 'Username is not registered'}), 400
    if not password:
        return jsonify({'message': 'Password is required'}), 400
    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    if user.password and bcrypt.check_password_hash(user.password, password):
        # Create JWT token
        session['username'] = username
        token = jwt.encode({
            'sub': username,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(hours=1)
        }, SECRET_KEY, algorithm='HS256')

        return jsonify({'token': token, "message": "Login successful"}), 200
    else:
        return jsonify({'message': 'Invalid username or password'}), 401


@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password or not email:
        return jsonify(message="Username, password, and email are required"), 400

    # Ensure username and email are unique
    existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
    if existing_user:
        return jsonify(message="Username or email already exists"), 400

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Create and save the new user
    user = User(
        username=username,
        password=hashed_password,
        email=email
    )
    
    db.session.add(user)
    db.session.commit()

    # Optionally return a JWT token or user ID
    # token = jwt.encode({
    #     'sub': user.username,
    #     'iat': datetime.datetime.utcnow(),
    #     'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    # }, SECRET_KEY, algorithm='HS256')

    # return jsonify(message="User created successfully!", token=token), 201
    return jsonify(message="User created successfully!"), 201

@app.route('/logout', methods=['POST'])
def logout():
    # session.pop('user', None)
    return jsonify(message="Logged out successfully"), 200


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists("build/" + path):
        return send_from_directory('build', path)
    else:
        return send_from_directory('build', 'index.html')


@app.route('/check_session', methods=['GET'])
def check_session():
    auth_header = request.headers.get('Authorization')

    if not auth_header:
        return jsonify({'isLoggedIn': False, 'message': 'Token is missing'}), 401

    token = auth_header.split(" ")[1]  # Extract token from 'Bearer <token>'

    try:
        # Decode the token
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        # If token is valid, return success response
        return jsonify({'isLoggedIn': True}), 200
    except ExpiredSignatureError:
        return jsonify({'isLoggedIn': False, 'message': 'Token has expired'}), 401
    except InvalidTokenError:
        return jsonify({'isLoggedIn': False, 'message': 'Invalid token'}), 401

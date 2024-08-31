from flask import jsonify, request, send_from_directory
from app import app, db
from models import User, Shift
import logging, os
from datetime import datetime, timedelta
from werkzeug.security import check_password_hash, generate_password_hash


@app.route('/user', methods=['POST'])
def create_user():
    if not request.is_json:
        return jsonify({'message': 'Request is not JSON'}), 400
    username = request.json.get('username')
    email = request.json.get('email')
    password = request.json.get('password')
    password = generate_password_hash(password)
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
        return jsonify(
            {'message': 'Invalid date format, should be YYYY-MM-DD'}), 400

    shift = Shift(
        username=username,
        date=date,
        start_time=start_time,
        end_time=end_time
    )

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
    return jsonify([{
        'date': shift.date,
        'start_time': shift.start_time,
        'end_time': shift.end_time} for shift in shifts])


# create a breakshift route to create breaks for a specific shift
@app.route('/break', methods=['POST'])
def create_break():
    if not request.is_json:
        return jsonify({'message': 'Request is not JSON'}), 400

    username = request.json.get('username')

    # measure break in minutes
    break_minutes = request.json.get('break_minutes')

    # automatically set break start time.
    break_start_time = datetime.now().time()

    # calculate break end time
    break_end_time = (datetime.combine(
        datetime.now(),
        break_start_time) + timedelta(minutes=break_minutes)).time()

    # create breakshift
    break_shift = Shift(
        username=username,
        date=datetime.now().date(),
        start_time=break_start_time,
        end_time=break_end_time,
        break_shift='yes'
    )

    db.session.add(break_shift)
    db.session.commit()

    logging.info(f'Break shift {username} created successfully')
    return jsonify({'message': 'Break shift created successfully!'})


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password, password):
        return jsonify(message="Login successful"), 200
    else:
        return jsonify(message="Invalid username or password"), 401


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    users = {user.username: user for user in User.query.all()}

    if username in users:
        return jsonify(message="User already exists"), 400

    user = User(
        username=username,
        password=generate_password_hash(password),
        email=email
    )

    db.session.add(user)
    db.session.commit()

    return jsonify(message="User created successfully!"), 201


@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify(message="Logged out successfully"), 200


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists("build/" + path):
        return send_from_directory('build', path)
    else:
        return send_from_directory('build', 'index.html')


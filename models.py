from factory import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(80), nullable=False)
    for_deletion = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<User {self.username}>'

class Shift(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    break_shift = db.Column(db.Enum('yes', 'no'), nullable=True, default='no') # TODO: use bool
    # If binary yes/no, replace with Boolean
    # break_shift = db.Column(db.Boolean, nullable=True, default=False)

    user = db.relationship('User', backref=db.backref('shifts', lazy=True))

    def __repr__(self):
        # Add a fallback in case user isn't loaded or is None
        return f'<Shift {self.user.username if self.user else "Unknown"} {self.date} {self.start_time}-{self.end_time}>'

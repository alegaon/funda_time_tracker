from app import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=True)
    email = db.Column(db.String(80), nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'

# create a Shift model with a foreign key to the User model
class Shift(db.Model):
    username = db.Column(db.String(80), db.ForeignKey('user.username'), primary_key=True)
    date = db.Column(db.Date, primary_key=True)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    
    def __repr__(self):
        return f'<Shift {self.username} {self.date} {self.start_time}-{self.end_time}>'

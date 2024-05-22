import os
import datetime
import pytz

from cs50 import SQL
from flask import Flask, flash, get_flashed_messages, jsonify, redirect, render_template, request, send_from_directory, session
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, String, Date, DateTime, Float
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from werkzeug.security import check_password_hash, generate_password_hash
from markupsafe import escape
from helpers import login_required

# Configure application
app = Flask(__name__)

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure SQLAlchemy 
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///workout-log.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True  # Enable signaling

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# Initialize the app with the extension
db.init_app(app)
print("Initialised the app.")

# TODO use ruff or something else, formatter.

class User(db.Model):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    archived_at: Mapped[DateTime] = mapped_column(DateTime, default=None, nullable=True)

class Workout(db.Model):
    __tablename__ = 'workouts'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, db.ForeignKey('users.id'), nullable=False)
    date: Mapped[Date] = mapped_column(Date, nullable=False)
    workout_name: Mapped[str] = mapped_column(String(100), nullable=False)
    workout_type: Mapped[str] = mapped_column(String(50), nullable=False)  # strength, cardio, yoga/pilates, stretching
    body_focus: Mapped[str] = mapped_column(String(50), nullable=False)  # upper, lower, full body
    duration_min: Mapped[int] = mapped_column(Integer, nullable=False)
    calories_burned: Mapped[int] = mapped_column(Integer, nullable=True)

class Exercise(db.Model): # database of info for each exercise for weight training
    __tablename__ = 'exercises'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    workout_id: Mapped[int] = mapped_column(Integer, db.ForeignKey('workouts.id'), nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)  # RDL, squat, etc
    muscle_group: Mapped[str] = mapped_column(String(50), nullable=False)  # quads, biceps, back, legs, etc
    
class WorkoutExercise(db.Model):
    __tablename__ = 'workout_exercises'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    workout_id: Mapped[int] = mapped_column(Integer, db.ForeignKey('workouts.id'), nullable=False)
    exercise_id: Mapped[int] = mapped_column(Integer, db.ForeignKey('exercises.id'), nullable=False)
    sets: Mapped[int] = mapped_column(Integer, nullable=True)
    reps: Mapped[int] = mapped_column(Integer, nullable=True)
    weight_kg: Mapped[float] = mapped_column(Float, nullable=False)  # 0 = bodyweight
    
# TODO: put this in method that can be called during app initialization
# https://flask.palletsprojects.com/en/3.0.x/patterns/appfactories/
with app.app_context():
    print("Creating database tables...")
    db.create_all()
    print("Tables created.")


@app.after_request
def after_request(response):
    # During development, you might want to disable caching to ensure that you're always seeing the most recent version of your site, not a cached version
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate" # tells the client's browser not to cache the response, not to store it, and to validate it
    response.headers["Expires"] = 0 #  sets the expiration date of the response to the past, which means it's already expired and can't be used from cache.
    response.headers["Pragma"] = "no-cache" #  older directive to prevent caching, mostly for HTTP/1.0 clients.
    return response


@app.route("/")
@login_required
def index():
    user = db.session.scalars(db.select(User).filter_by(id=session["user_id"])).first()
    return render_template("index.html", username=user.username)

@app.route('/dist/<path:filename>')
def dist(filename):
    return send_from_directory('dist', filename)

@app.route("/login", methods=["GET", "POST"])
def login():
    session.clear() # Forget any user_id >> this clears flashed messages also, use alert instead of flash
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        if not username or not password:
            flash("Please fill out both username and password.")
            return redirect("/login")
        user = db.session.scalars(db.select(User).filter_by(username=username)).first()
        if not user:
            flash("Username doesn't exist")
            return redirect("/login")
        if not check_password_hash(user.password_hash, password):
            flash("Incorrect password")
            return redirect("/login")
        flash(f"signed in as <b>@{escape(user.username)}</b>!")
        session["user_id"] = user.id
        return redirect("/")
    return render_template("login.html")


@app.route("/logout")
def logout():
    # clears session, effectively logging a user out.
    session.clear()
    flash("successfully signed out")
    return redirect("/")


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        password_confirm = request.form.get("confirmation")
        email = request.form.get("email")
        # TODO make checking parameters more succinct
        # show all the errors at once, so the user can correct everything before submitting again
        if not username:
            flash("Please enter username.")
            return render_template("register.html")
        if not password:
            flash("Please enter password.")
            return render_template("register.html")
        if not email:
            flash("Please enter email.")
            return render_template("register.html")
        if password != password_confirm:
            flash("Passwords do not match.")
            return render_template("register.html")
        # checks if username or email exist
        if db.session.execute(db.select(User).filter_by(username=username)).first():
            flash("This username already exists.")
            return render_template("register.html")
        if db.session.execute(db.select(User).filter_by(email=email)).first():
            flash("This email already exists.")
            return render_template("register.html")

        # hash password
        # TODO use stronger hash method with scrypt.
        password_hash = generate_password_hash(password, method="pbkdf2", salt_length=16)

        # put in db
        new_user = User(username=username, email=email, password_hash=password_hash)
        db.session.add(new_user)
        db.session.commit()

        flash("You are now registered.")
        return redirect("/login")

    return render_template("register.html")
import os
import datetime
import pytz

from cs50 import SQL
from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, String, Date, DateTime, Float
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from werkzeug.security import check_password_hash, generate_password_hash

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
# initialize the app with the extension
db.init_app(app)
print("Initialised the app.")

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

    

with app.app_context():
    print("Creating database tables...")
    db.create_all()
    print("Tables created.")


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/")
@login_required
def index():
    return render_template("index.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    """TODO Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        return redirect("/")
    else:
        return render_template("index.html")
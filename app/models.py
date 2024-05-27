from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, String, Date, DateTime, Float
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


db = SQLAlchemy()

class Base(DeclarativeBase):
    pass

class User(db.Model):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    archived_at: Mapped[DateTime] = mapped_column(DateTime, default=None, nullable=True)

class Workout(db.Model):
    __tablename__ = 'workouts'
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(db.ForeignKey('users.id'), nullable=False)
    date: Mapped[Date] = mapped_column(Date, nullable=False)
    workout_name: Mapped[str] = mapped_column(String(100), nullable=False)
    workout_type: Mapped[str] = mapped_column(String(50), nullable=False)  # strength, cardio, yoga/pilates, stretching
    body_focus: Mapped[str] = mapped_column(String(50), nullable=False)  # upper, lower, full body
    duration_min: Mapped[int] = mapped_column(nullable=False)
    calories_burned: Mapped[int] = mapped_column(nullable=True)

class Exercise(db.Model): # database of info for each exercise for weight training
    __tablename__ = 'exercises'
    id: Mapped[int] = mapped_column(primary_key=True)
    workout_id: Mapped[int] = mapped_column(db.ForeignKey('workouts.id'), nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)  # RDL, squat, etc
    muscle_group: Mapped[str] = mapped_column(String(50), nullable=False)  # quads, biceps, back, legs, etc
    
class WorkoutExercise(db.Model):
    __tablename__ = 'workout_exercises'
    id: Mapped[int] = mapped_column(primary_key=True)
    workout_id: Mapped[int] = mapped_column(db.ForeignKey('workouts.id'), nullable=False)
    exercise_id: Mapped[int] = mapped_column(db.ForeignKey('exercises.id'), nullable=False)
    sets: Mapped[int] = mapped_column(nullable=True)
    reps: Mapped[int] = mapped_column(nullable=True)
    weight_kg: Mapped[float] = mapped_column(nullable=False)  # 0 = bodyweight

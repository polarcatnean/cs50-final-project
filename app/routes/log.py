from flask import Blueprint, jsonify, render_template, redirect, url_for, request, session, flash
from app.models import db, Workout
from datetime import datetime
from app.helpers import login_required

log = Blueprint('log', __name__)


@log.route("/add", methods=["POST"])
@login_required
def add_workout():
    user_id = session.get("user_id")
    data = request.get_json()

    new_workout = Workout(
        user_id=user_id,
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        workout_name=data['workout_name'],
        workout_type=data['workout_type'],
        body_focus=data['body_focus'],
        duration_min=data['duration_min'],
        calories_burned=data.get('calories_burned') # because this is optional, returns None if empty, prevents "KeyError"
    )

    print(new_workout)
    db.session.add(new_workout)
    db.session.commit()
    # flash("Workout logged successfully")
    return jsonify({'message': 'Workout logged successfully'})


@log.route("/edit", methods=["GET", "POST"])
@login_required
def edit_workout(id):
    return

@log.route('/load', methods=["GET"])
@login_required
def get_log():
    user_id = session.get("user_id")
    # only get log from this user_id
    events = Workout.query.filter_by(user_id=user_id).all()
    event_list = []
    for event in events:
        event_list.append({
            'id': event.id,
            'title': f"<b>{event.duration_min} min</b><br>{event.workout_name}",
            'start': event.date.strftime('%Y-%m-%d'),
            'end': event.date.strftime('%Y-%m-%d'),
            'description': event.workout_type,
            'allDay': True,
            'color': 'white',  # specify color bg for event boxes
            'textColor': '#a491c9'
        })
    return jsonify(event_list)
from flask import Blueprint, jsonify, render_template, redirect, url_for, request, session
from app.models import db, Exercise, Workout, WorkoutExercise
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

    db.session.add(new_workout)
    db.session.commit()
    
    return jsonify({'message': 'Workout logged successfully', 'id': new_workout.id}) # return autoincremented ID to JS


@log.route("/add_exercise", methods=["POST"])
@login_required
def add_exercise():
    user_id = session.get("user_id")
    data = request.get_json()

    new_exercise = WorkoutExercise(
        user_id=user_id,
        workout_id=data['workout_id'],
        exercise_id=data['exercise_id'],
        sets=data['sets'],
        reps=data['reps'],
        weight_kg=data['weight']
    )

    db.session.add(new_exercise)
    db.session.commit()
    
    return jsonify({'message': 'Exercise logged successfully', 'workoutExerciseId': new_exercise.id})


@log.route("/delete/<int:workout_id>", methods=["DELETE"])
@login_required
def delete_workout(workout_id):
    user_id = session.get("user_id")
    workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()
    
    if not workout:
        return jsonify({"error": "Workout not found"}), 404

    db.session.delete(workout)
    db.session.commit()
    
    return jsonify({"message": "Workout deleted successfully"}), 200


# TODO edit route 
@log.route("/edit/<int:workout_id>", methods=["POST"])
@login_required
def edit_workout(workout_id):
    user_id = session.get("user_id")
    workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()
    
    if not workout:
        return jsonify({"error": "Workout not found"}), 404
    
    return jsonify({"message": "Workout edited successfully"}), 200


@log.route('/load', methods=["GET"])
@login_required
def get_log():
    user_id = session.get("user_id")
    # only get log from this user_id
    events = Workout.query.filter_by(user_id=user_id).all()
    event_list = []
    for event in events:
        body_focus_class = f"focus-{event.body_focus}"
        event_list.append({
            'id': event.id,
            'title': f"<b>{event.duration_min} min</b><br>{event.workout_name}",
            'start': event.date.strftime('%Y-%m-%d'),
            'end': event.date.strftime('%Y-%m-%d'),
            'classNames': [body_focus_class],
            'extendedProps': {
                'workoutName': event.workout_name,
                'duration': event.duration_min,
                'type': event.workout_type,
                'focus': event.body_focus,
                'calories': event.calories_burned
            },
            'allDay': True,
        })
    print(event_list)  # Debug print
    return jsonify(event_list)


@log.route('/load_exercises', methods=['GET'])
def load_exercises():
    body_focus = request.args.get('body_focus')
    exercises = Exercise.query.filter_by(body_focus=body_focus).all()
    exercise_list = [{"id": exercise.id, "name": exercise.name} for exercise in exercises]
    return jsonify(exercise_list)


@log.route('/details/<int:event_id>', methods=["GET"])
@login_required
def get_workout_details(event_id):
    user_id = session.get("user_id")
    # Replace this with your actual database query
    event = Workout.query.filter_by(user_id=user_id, id=event_id).first()
    exercises = WorkoutExercise.query.filter_by(user_id=user_id, workout_id=event_id).all()

    if event is None:
        return "Event not found", 404
    
    muscle_groups = set()
    secondary_muscle_groups = set()
    for exercise in exercises:
        if exercise.info_exercise:
            muscle_groups.update(exercise.info_exercise.muscle_group.split(","))
            if exercise.info_exercise.muscle_group_secondary:
                secondary_muscle_groups.add(exercise.info_exercise.muscle_group_secondary)
    
    muscle_groups = sorted(muscle_groups)
    secondary_muscle_groups = sorted(secondary_muscle_groups)

    return render_template('workout-details.html', event=event, exercises=exercises, muscle_groups=muscle_groups, secondary_muscle_groups=secondary_muscle_groups)
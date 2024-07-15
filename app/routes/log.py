from flask import Blueprint, jsonify, render_template, redirect, url_for, request, session
from sqlalchemy import extract, func
from app.models import db, Exercise, Workout, WorkoutExercise
from datetime import datetime
from app.helpers import login_required

log = Blueprint('log', __name__)


@log.route("/add", methods=["POST"])
@login_required
def add_workout():
    user_id = session.get("user_id")
    data = request.get_json()

    required_fields = ['date', 'workout_name', 'workout_type', 'body_focus', 'duration_min']
    for field in required_fields:
        if field not in data or data[field] == "":
            return jsonify({'error': f'Missing required field: {field}'}), 400
            
    new_workout = Workout(
        user_id=user_id,
        date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
        workout_name=data['workout_name'],
        workout_type=data['workout_type'],
        body_focus=data['body_focus'],
        duration_min=data['duration_min'],
        calories_burned=data.get('calories_burned') # Optional field, returns None if empty, prevents "KeyError"
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
    exercises = WorkoutExercise.query.filter_by(workout_id=workout_id, user_id=user_id).all()
    
    if not workout:
        return jsonify({"error": "Workout not found"}), 404
    
    db.session.delete(workout)
    
    exercises_deleted = False
    exercise_ids = []
    if exercises:
        exercises_deleted = True
        for exercise in exercises:
            exercise_ids.append(exercise.exercise_id)
            db.session.delete(exercise)
        
    db.session.commit()

    if exercises_deleted:
        message = f"Workout and associated exercise ids [{exercise_ids}] deleted successfully"
    else:
        message = "Workout deleted successfully, no associated exercises found"
    
    return jsonify({"message": message}), 200


@log.route("/edit_workout/<int:workout_id>", methods=["PUT"])
@login_required
def edit_workout(workout_id):
    user_id = session.get("user_id")
    data = request.get_json()

    workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()
    
    if not workout:
        return jsonify({"error": "Workout not found"}), 404

    # Update workout details
    workout.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    workout.workout_name = data['workout_name']
    workout.workout_type = data['workout_type']
    workout.body_focus = data['body_focus']
    workout.duration_min = data['duration_min']
    workout.calories_burned = data.get('calories_burned')
    
    db.session.commit()
    
    return jsonify({"message": "Workout updated successfully", "id": workout.id})


@log.route('/fill_workout_data/<int:workout_id>', methods=["GET"])
@login_required
def get_workout_data(workout_id):
    user_id = session.get("user_id")
    workout = Workout.query.filter_by(id=workout_id, user_id=user_id).first()
    has_exercises = db.session.query(func.count(WorkoutExercise.id)).filter_by(workout_id=workout_id, user_id=user_id).scalar()

    if not workout:
        return jsonify({"error": "Workout not found"}), 404

    workout_data = {
        "id": workout.id,
        "date": workout.date,
        "workout_name": workout.workout_name,
        "workout_type": workout.workout_type,
        "body_focus": workout.body_focus,
        "duration_min": workout.duration_min,
        "calories_burned": workout.calories_burned,
        "has_exercises": has_exercises
    }

    return jsonify(workout_data)


@log.route('/edit_exercise/<int:workoutExercise_id>', methods=["PUT"])
@login_required
def edit_exercise(workoutExercise_id):
    user_id = session.get("user_id")
    exercise = WorkoutExercise.query.filter_by(id=workoutExercise_id, user_id=user_id).first()

    if not exercise:
        return jsonify({"error": "Exercise not found"}), 404

    data = request.get_json()
    exercise.exercise_id = data['exercise_id']
    exercise.sets = data['sets']
    exercise.reps = data['reps']
    exercise.weight_kg = data['weight']

    db.session.commit()

    return jsonify({"message": "Exercise updated successfully"})


@log.route('/fill_exercise_data/<int:workout_id>', methods=["GET"])
@login_required
def get_exercise_data(workout_id):
    user_id = session.get("user_id")
    exercises = WorkoutExercise.query.filter_by(workout_id=workout_id, user_id=user_id).all()

    if not exercises:
        return jsonify({"error": "Workout has no associated exercises"}), 404

    exercises_data = []
    for exercise in exercises:
        exercise_data = {
            # "index": index,
            "id": exercise.id,
            "exercise_id": exercise.exercise_id,
            "sets": exercise.sets,
            "reps": exercise.reps,
            "weight": exercise.weight_kg
        }
        exercises_data.append(exercise_data)

    return jsonify(exercises_data)


@log.route('/load', methods=["GET"])
@login_required
def get_log():
    user_id = session.get("user_id")

    events = Workout.query.filter_by(user_id=user_id).all()
    event_list = []
    for event in events:
        if event.workout_type == "cardio":
            body_focus_class = "focus-cardio"
        else: 
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
    event = Workout.query.filter_by(user_id=user_id, id=event_id).first()
    exercises = WorkoutExercise.query.filter_by(user_id=user_id, workout_id=event_id).all()

    if event is None:
        return "Workout not found", 404
    
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


@log.route('/get_monthly_stats/<YYYYMM>', methods=["GET"])
@login_required
def get_monthly_stats(YYYYMM):
    user_id = session.get("user_id")

    # Parse the year_month parameter (format 'YYYYMM')
    year = int(YYYYMM[:4])
    month = int(YYYYMM[4:])

    # Query the total exercise days
    total_days = db.session.query(func.count(Workout.id)).filter(
        extract('year', Workout.date) == year,
        extract('month', Workout.date) == month,
        Workout.user_id == user_id
    ).scalar()

    # Query the cardio days
    cardio_days = db.session.query(func.count(Workout.id)).filter(
        extract('year', Workout.date) == year,
        extract('month', Workout.date) == month,
        Workout.user_id == user_id,
        Workout.workout_type == 'cardio'
    ).scalar()

    # Query the upper body days
    upper_body_days = db.session.query(func.count(Workout.id)).filter(
        extract('year', Workout.date) == year,
        extract('month', Workout.date) == month,
        Workout.user_id == user_id,
        Workout.body_focus == 'upper'
    ).scalar()

    # Query the lower body days
    lower_body_days = db.session.query(func.count(Workout.id)).filter(
        extract('year', Workout.date) == year,
        extract('month', Workout.date) == month,
        Workout.user_id == user_id,
        Workout.body_focus == 'lower'
    ).scalar()

    # Query the strength days (upper + lower)
    strength_days = upper_body_days + lower_body_days

    # Query the yoga days
    yoga_days = db.session.query(func.count(Workout.id)).filter(
        extract('year', Workout.date) == year,
        extract('month', Workout.date) == month,
        Workout.user_id == user_id,
        Workout.workout_type == 'yoga_pilates'
    ).scalar()


    # Convert the workouts to a JSON-serializable format (e.g., dictionaries)
    stats_data = {
        'exerciseDays': total_days,
        'cardioDays': cardio_days,
        'upperBodyDays': upper_body_days,
        'lowerBodyDays': lower_body_days,
        'strengthDays': strength_days,
        'yogaDays': yoga_days
    }

    return jsonify(stats_data)

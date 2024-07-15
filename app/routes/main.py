from flask import Blueprint, redirect, render_template, session, send_from_directory, g
from app.models import db, User
from app.helpers import login_required
import os


main = Blueprint('main', __name__)

@main.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')
    if user_id is None:
        g.user = None
    else:
        g.user = db.session.scalars(db.select(User).filter_by(id=user_id)).first()

@main.context_processor
def inject_user():
    return dict(username=g.user.username if g.user else None)


@main.route("/")
@login_required
def index():
    return render_template("index.html")


@main.route('/dist/<path:filename>')
def dist(filename):
    return send_from_directory(os.path.join(os.getcwd(), 'dist'), filename)


@main.route("/log")
def log_page():
    return redirect("/")


@main.route("/stats")
def stats_page():
    return render_template("stats.html")


@main.route("/timer")
def timer_page():
    return render_template("timer.html")
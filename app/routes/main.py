from flask import Blueprint, redirect, render_template, session, send_from_directory
from app.models import db, User
from app.helpers import login_required
import os


main = Blueprint('main', __name__)


@main.route("/")
@login_required
def index():
    user = db.session.scalars(db.select(User).filter_by(id=session["user_id"])).first()
    # if user is None:
    #     return redirect("auth/login")
    return render_template("index.html", username=user.username)


@main.route('/dist/<path:filename>')
def dist(filename):
    return send_from_directory(os.path.join(os.getcwd(), 'dist'), filename)


@main.route("/log")
def log_page():
    return redirect("/")


@main.route("/timer")
def timer_page():
    return render_template("timer.html")
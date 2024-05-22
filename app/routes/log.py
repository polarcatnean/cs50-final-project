from flask import Blueprint, render_template, redirect, url_for, request, session, flash
from app.models import db, Workout
from datetime import datetime
from app.helpers import login_required

log = Blueprint('log', __name__)


@log.route("/add", methods=["GET", "POST"])
@login_required
def add_workout():
    return render_template("index.html")


@log.route("/edit", methods=["GET", "POST"])
@login_required
def edit_workout(id):
    return


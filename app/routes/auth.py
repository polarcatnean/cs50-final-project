from flask import Blueprint, render_template, redirect, url_for, request, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
from markupsafe import escape
from app.models import db, User


auth = Blueprint('auth', __name__)


@auth.route("/login", methods=["GET", "POST"])
def login():
    session.clear() # Forget any user_id >> this clears flashed messages also, use alert instead of flash
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        if not username or not password:
            flash("Please fill out both username and password.")
            return redirect(url_for("auth.login"))
        user = db.session.scalars(db.select(User).filter_by(username=username)).first()
        if not user:
            flash("Username doesn't exist")
            return redirect(url_for("auth.login"))
        if not check_password_hash(user.password_hash, password):
            flash("Incorrect password")
            return redirect(url_for("auth.login"))
        flash(f"signed in as <b>@{escape(user.username)}</b>!")
        session["user_id"] = user.id
        return redirect("/")
    return render_template("login.html")


@auth.route("/logout")
def logout():
    # clears session, effectively logging a user out.
    session.clear()
    flash("You have been logged out")
    return redirect(url_for("auth.login"))


@auth.route("/register", methods=["GET", "POST"])
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
        password_hash = generate_password_hash(password, method="scrypt", salt_length=16)

        # put in db
        new_user = User(username=username, email=email, password_hash=password_hash)
        db.session.add(new_user)
        db.session.commit()

        flash("You are now registered.")
        return redirect(url_for("auth.login"))

    return render_template("register.html")

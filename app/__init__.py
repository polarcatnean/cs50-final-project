from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from config import Config
from app.models import db
from app.helpers import login_required, capitalise



def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Custom filter
    app.jinja_env.filters["capitalise"] = capitalise
    
    # Initialize plugins
    db.init_app(app)
    Session(app)

    # Register blueprints
    from app.routes.auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint, url_prefix='/auth')

    from app.routes.main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from app.routes.log import log as log_blueprint
    app.register_blueprint(log_blueprint, url_prefix='/log')


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

    return app
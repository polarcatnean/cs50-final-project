class Config:
    SESSION_PERMANENT = False
    SESSION_TYPE = "filesystem"
    SQLALCHEMY_DATABASE_URI = 'sqlite:///workout-log.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = True
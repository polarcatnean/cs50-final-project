import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Exercise, db
from config import Config

# Replace this with your actual database URI
DATABASE_URI = 'sqlite:///./instance/workout-log.db'

# Set up the database engine and session
engine = create_engine(DATABASE_URI)
Session = sessionmaker(bind=engine)
session = Session()

# Read the Excel file
file_path = 'app/static/exercises.xlsx'
df = pd.read_excel(file_path)

# Inspect the DataFrame to understand its structure
print(df.head())

# Assuming your Excel file has columns: 'name', 'body_focus', 'muscle_group', 'muscle_group_secondary'
# Transform the data if necessary
exercises = []
for index, row in df.iterrows():
    exercise = Exercise(
        name=row['name'],
        body_focus=row['body_focus'],
        muscle_group=row['muscle_group'],
        muscle_group_secondary=row.get('muscle_group_secondary', None)
    )
    exercises.append(exercise)

# Add all the exercises to the session
session.add_all(exercises)

# Commit the session to write the data to the database
session.commit()

print(f"{len(df)} rows have been inserted successfully.")

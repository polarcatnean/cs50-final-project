# Workout Log Calendar
#### Video Demo:  <URL HERE>


## Overview

The Workout Log Calendar is a web application designed to help users log and track their workouts and exercises using a calendar interface. This project combines the Flask web framework for the backend with JavaScript and various front-end libraries to create a responsive and interactive user experience.

The primary goal of this project is to provide users with an easy-to-use tool for recording their fitness activities, viewing their workout history, and analyzing their exercise patterns over time. This README.md will cover the project structure, describe the functionality of each file, and explain the design decisions made during development.

## Table of Contents

- [Installation](#installation)
- [First-time Setup](#first-time-setup)
- [Usage](#usage)
- [Features](#features)
- [File Descriptions](#file-descriptions)
- [Design Choices](#design-choices)
- [License](#license)
- [Contact](#contact)


## Installation

To install the necessary dependencies for this project, follow the steps below:

### For Node.js Dependencies:

1. Clone the repository:

    ```bash
    git clone https://github.com/polarcatnean/cs50-final-project.git
    ```

2. Navigate to the project directory:

    ```bash
    cd cs50-final-project
    ```

3. Install Node.js dependencies:

    ```bash
    npm install
    ```

### For Python Dependencies:

1. Make sure you have Python installed. You can download it from [python.org](https://www.python.org/).

2. (Optional but recommended) Create a virtual environment:

    ```bash
    python -m venv venv
    ```

3. Activate the virtual environment:

    - On Windows:

        ```bash
        venv\Scripts\activate
        ```

    - On macOS and Linux:

        ```bash
        source venv/bin/activate
        ```

4. Install the dependencies listed in `requirements.txt`:

    ```bash
    pip install -r requirements.txt

    ```
### For Webpack Setup

Webpack is used to bundle JavaScript modules and other assets. Ensure you have the necessary Node.js packages installed by running `npm install` as described above. The Webpack configuration file (`webpack.config.js`) is already included in the project.


## First-time Setup

Before you can use the application, you need to load the initial exercises into the database.

1. Place the `exercises.xlsx` file in the `app/static/` directory. You can add more exercises to it.

2. Run the `load-exercises.py` script to populate the database with the initial exercises:

    ```bash
    python load-exercises.py
    ```

    
## Usage

To run the project, follow these steps:

1. Start the Flask application:

    ```bash
    flask run
    ```

2. In a new terminal, start the Webpack server:

    ```bash
    npm start
    ```

3. Open your browser and navigate to `http://127.0.0.1:5000` to view the application.


## Features

- **User Authentication**: Secure login and registration system to keep your workout data private.
- **Workout Logging**: Log various types of workouts including strength training, cardio, and yoga.
- **Exercise Logging**: Add specific exercises to your workouts with details like sets, reps, and weight.
- **Calendar View**: View your logged workouts and exercises in a calendar format.
- **Statistics**: View detailed statistics on your workout types and exercise frequencies.
- **Responsive Design**: Accessible and functional on various devices.


## File Descriptions

### Backend Files

- **`__init__.py`**: Initializes the Flask application, configures it, and sets up the database and session management. Registers the blueprints for different routes.
  
- **`models.py`**: Defines the database models using SQLAlchemy. Models include `User`, `Workout`, `Exercise`, and `WorkoutExercise` to store user and workout-related data.
  
- **`auth.py`**: Contains routes and logic for user authentication, including login, registration, and logout functionalities.
  
- **`main.py`**: Defines the main routes for rendering templates and serving static files. Includes routes for the homepage, logging workouts, and viewing statistics.
  
- **`log.py`**: Handles the routes for logging workouts and exercises, retrieving workout data, and performing CRUD operations on workouts and exercises.
  
- **`helpers.py`**: Provides utility functions and decorators, such as `login_required` to ensure routes are accessible only to logged-in users, and formatting functions for display purposes.
  
- **`load-exercises.py`**: A script to load initial exercise data from an Excel file into the database. Reads the data using pandas and inserts it into the `Exercise` model.

### Frontend Files

- **`index.html`**: The main HTML template for the application, extending the base layout and including sections for the calendar and workout details.
  
- **`script.js`**: Contains the JavaScript code for handling user interactions, calendar functionality, and AJAX requests to the backend. Manages workout and exercise modals, event handling, and form submissions.
  
- **`stats.js`**: Handles the logic for displaying workout statistics, fetching data from the backend, and rendering charts to visualize exercise data.

### Webpack Configuration

- **`webpack.config.js`**: Configuration file for Webpack, a module bundler used to compile JavaScript modules. This file defines the entry points, output settings, and loaders for processing different types of files (e.g., JavaScript, CSS, images).

- **`package.json`**: Contains metadata about the project and lists the Node.js dependencies, including Webpack and its plugins.


## Design Choices

1. **Technology Stack**: 
   - **Flask**: Chosen for its simplicity and ease of use for backend development. It provides a lightweight framework for building web applications with Python.
   - **SQLAlchemy**: Used for database management due to its powerful ORM capabilities, which simplify database interactions and migrations.
   - **JavaScript**: Utilized for front-end interactivity, particularly with libraries like FullCalendar for the calendar view and Chart.js for statistics visualization.

2. **Modular Structure**: The application is divided into blueprints (`auth`, `main`, `log`) to separate concerns and improve maintainability. This modular structure allows for easier scalability and testing.

3. **Responsive Design**: The application uses Bootstrap to ensure it is accessible and functional on various devices, providing a seamless user experience across desktops, tablets, and smartphones.

4. **User Authentication**: Implemented secure authentication using hashing for passwords and session management to protect user data and ensure privacy.

5. **Data Integrity**: The `load-exercises.py` script ensures that the initial data is correctly loaded into the database, providing a solid foundation for users to start logging their workouts.

6. **Error Handling**: Incorporated error handling in backend routes to provide meaningful feedback to users and ensure smooth operation of the application.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## Contact

For any inquiries, please contact:

- Email: nneann@gmail.com
- GitHub: [polarcatnean](https://github.com/polarcatnean)

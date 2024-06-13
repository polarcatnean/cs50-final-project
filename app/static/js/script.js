import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import 'bootstrap/dist/css/bootstrap.css';
import * as bootstrap from 'bootstrap';
import 'flatpickr/dist/flatpickr.min.css';
import flatpickr from 'flatpickr';
import '../css/styles.css'; // my custom css


// Initialise global variables
let selectedDate = "";
let selectedWorkoutId = "";
let loggingWorkoutId = "";
let selectedBodyFocus = "";
let clickedDayElement = null;
let calendar;

// Helper functions
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Intl.DateTimeFormat('en-GB', options).format(date);
}

function formatDateYMD(dateString) {
  // Create a new Date object from the input date string
  const date = new Date(dateString);
  // Check if the date is valid
  if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
  }
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Load exercise options according to bodyfocus
function fetchExercises(selectedBodyFocus) {
  fetch(`/log/load_exercises?body_focus=${selectedBodyFocus}`)
      .then(response => response.json())
      .then(data => {
          const exerciseSelect = document.getElementById('exercise-id');
          exerciseSelect.innerHTML = '<option selected>Select exercise</option>';
          data.forEach(exercise => {
              const option = document.createElement('option');
              option.value = exercise.id;
              option.textContent = capitalise(exercise.name);
              exerciseSelect.appendChild(option);
          });
      })
      .catch(error => console.error('Error fetching exercises:', error));
}

// Delete workout 
function deleteWorkout(workoutId) {
  fetch(`/log/delete/${workoutId}`, {
      method: 'DELETE',
      headers: {
          'Content-Type': 'application/json',
      },
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      console.log('Success:', data);
      // Optionally, remove the workout from the DOM or refresh the page
      location.reload(); // Refresh the page to reflect changes
  })
  .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while deleting the workout.');
  });
}

// TODO: edit workout function




// After HTML is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize flatpickr on the date input field
  flatpickr("#date", {
    dateFormat: "j M Y", // Set the desired date format
  });

  // Init Calendar & config
  const calendarEl = document.getElementById('calendar');
  
  calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'title',
      center: '',
      right: 'today prev,next' 
    },
    defaultView: 'dayGridMonth',
    events: '/log/load',  // route to fetch events from
    eventDidMount: function(info) {

    },
    eventContent: function(info) {
      let customHtml = info.event.title; 
      let content = document.createElement('div');
      content.innerHTML = customHtml;
      return { domNodes: [content] };
    },
    datesSet: function() {
        let middleElement = document.querySelectorAll('.fc-toolbar-chunk')[1];
        
        let progressBar = document.createElement("div");
        progressBar.className = "progress";
        progressBar.role = "progressbar";

        let innerDiv = document.createElement('div');
        innerDiv.className = 'progress-bar progress-bar-striped';
        innerDiv.innerText = '65%';

        progressBar.appendChild(innerDiv);
        middleElement.innerHTML = "";
        middleElement.appendChild(progressBar);
    },
    dateClick: function(info) {
        info.jsEvent.preventDefault();
        // Show the Bootstrap modal when a date is clicked
        info.allDay = false;
        selectedDate = info.dateStr;
        let time = new Date().toLocaleTimeString();
        clickedDayElement = info.dayEl;
        console.log(`${selectedDate} is clicked at ${time}`);
        document.getElementById("date").value = formatDate(selectedDate);
        document.getElementById('logEditModal').textContent = 'Log Workout';
        document.getElementById('save-button').textContent = 'Log Workout';
        document.getElementById('log-exercise-button').textContent = 'Log individual exercise';
        document.getElementById('log-edit-form').dataset.action = 'log';
        let logModal = new bootstrap.Modal(document.getElementById('log-edit-modal'), { focus: true });
        logModal.show();
    },
    eventClick: function(info) {
      let event = info.event; // the associated Event Object
      selectedWorkoutId = event.id;
      console.log(event);
      console.log(`selectedWorkoutId: ${selectedWorkoutId}`);
      let offcanvasElement = document.getElementById('detail-canvas');
      let offcanvas = new bootstrap.Offcanvas(offcanvasElement);

      // Fetch the workout details HTML from the server
      fetch(`/log/details/${event.id}`)
          .then(response => response.text())
          .then(html => {
              let workoutDetailsEl = document.getElementById('workout-details');
              workoutDetailsEl.innerHTML = html; // Insert the HTML content
              offcanvas.show(); // Show the offcanvas
          })
          .catch(error => {
              console.error('Error fetching workout details:', error);
          });
    },
  })

  calendar.render();

  

  // >> Enable log exercise button based on workout type
  const workoutTypeElement = document.getElementById('workout-type');
  const logExerciseButton = document.getElementById('log-exercise-button');
  function toggleButton() {
      if (workoutTypeElement.value === 'strength') {
          logExerciseButton.removeAttribute('disabled');
          console.log("Button enabled");
      } else {
          logExerciseButton.setAttribute('disabled', 'disabled');
      }
  }
  // Initial check
  toggleButton();
  // Add event listener for changes
  workoutTypeElement.addEventListener('change', toggleButton);


  // >> Delete workout button
  const deleteWorkoutButton = document.getElementById('delete-workout');
  deleteWorkoutButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to delete this workout?')) {
        deleteWorkout(selectedWorkoutId);
    }
  });
  // TODO: Edit workout button
  const editWorkoutButton = document.getElementById('edit-workout');
  editWorkoutButton.addEventListener('click', function() {
    fetch(`/log/edit_workout/${selectedWorkoutId}`)
    .then(response => response.json())
    .then(data => {
        // Populate the form with existing workout data
        document.getElementById('date').value = formatDate(data.date);
        document.getElementById('duration-min').value = data.duration_min;
        document.getElementById('calories-burned').value = data.calories_burned || '';
        document.getElementById('workout-name').value = data.workout_name;
        document.getElementById('workout-type').value = data.workout_type;
        document.getElementById('body-focus-1').value = data.body_focus;

        // Set the modal title and button
        document.getElementById('logEditModal').textContent = 'Edit Workout';
        document.getElementById('log-exercise-button').textContent = 'Edit exercises';
        document.getElementById('save-button').textContent = 'Save changes';

        // Set an identifier for the form action
        document.getElementById('log-edit-form').dataset.action = 'edit';
        document.getElementById('log-edit-form').dataset.workoutId = selectedWorkoutId;
        new bootstrap.Modal(document.getElementById('log-edit-modal')).show();
    })
    .catch(error => {
        console.error('Error fetching workout details:', error);
    });
  });

// DOMContentLoaded closed
});


// Handle form submission in the modal
// Workout submission
document.getElementById('save-button').addEventListener('click', function(event) {
  event.preventDefault(); // Prevent the default form submission behavior

  const action = document.getElementById('log-edit-form').dataset.action;
  const workoutId = document.getElementById('log-edit-form').dataset.workoutId;
  const url = action === 'log' ? '/log/add' : `/log/edit/${workoutId}`;
  const method = action === 'log' ? 'POST' : 'PUT';

  // Collect form data
  let formData = {
    date: formatDateYMD(document.getElementById('date').value),
    duration_min: document.getElementById('duration-min').value,
    calories_burned: document.getElementById('calories-burned').value,
    workout_name: document.getElementById('workout-name').value,
    workout_type: document.getElementById('workout-type').value,
    body_focus: document.getElementById('body-focus-1').value
  };
  console.log(JSON.stringify(formData));
  console.log(formData);

  // Use fetch to send the form data
  fetch(url, {
    method: method, 
    headers: {
        'Content-Type': 'application/json', // Set the request headers
    },
    body: JSON.stringify(formData), // Convert the form data to JSON and send in the request body
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      console.log('Success:', data);
      loggingWorkoutId = data.id; // Get the new workout ID from the response
      // Add workout event to calendar
      // TODO: validate input
      if (formData["date"] && formData["duration_min"] && formData["workout_name"]) {

        let bodyFocusClass = "";
        if (formData["workout_type"] == "cardio") {
          bodyFocusClass = "focus-cardio";
        }
        else {
          bodyFocusClass = `focus-${formData["body_focus"]}`;
        }
        if (action === 'log') {
          calendar.addEvent({
            id: loggingWorkoutId, // Include the new workout ID in the event object
            title: `<b>${formData["duration_min"]} min</b><br>${formData["workout_name"]}`, // Use HTML directly in the title
            start: formData["date"], // Use formData["date"] for the start date
            allDay: true,
            classNames: [bodyFocusClass],
            extendedProps: {
              duration: formData["duration_min"],
              workoutName: formData["workout_name"]
            },
          });
        }
      }
      document.getElementById('log-edit-form').reset();
  })
  .catch(error => {
      console.error('Error:', error);
  });

  // Close the modal
  let modalElement = document.getElementById('log-edit-modal');
  let modalInstance = bootstrap.Modal.getInstance(modalElement);
  modalInstance.hide();

// Workout submission closed
});

// transfer body focus to the exercise log form & autofocus the sets field
const exerciseLogModal = document.getElementById('exercise-log-modal');
exerciseLogModal.addEventListener('show.bs.modal', function() {
  selectedBodyFocus = document.getElementById('body-focus-1').value;
  document.getElementById('body-focus-2').value = selectedBodyFocus;
  // init exercise dropdown choices
  fetchExercises(selectedBodyFocus);
  const setField = document.getElementById('sets');
  setField.focus();
  // Exercise selector dropdown change listener
  const bodyFocusSelect = document.getElementById('body-focus-2');
  bodyFocusSelect.addEventListener('change', function() {
    selectedBodyFocus = bodyFocusSelect.value;
    fetchExercises(selectedBodyFocus);
  });
});


// Log exercise submission
document.getElementById('exercise-log-form').addEventListener('submit', function(event) {
  event.preventDefault();

  // Collect form data
  let exerciseData = {
    workout_id: loggingWorkoutId,
    exercise_id: document.getElementById('exercise-id').value,
    sets: document.getElementById('sets').value,
    reps: document.getElementById('reps').value,
    weight: document.getElementById('weight').value,
  };

  fetch('/log/add_exercise', {
    method: 'POST', 
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(exerciseData) 
  })
  .then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
      console.log('Success:', data);
      document.getElementById('exercise-log-form').reset();
      document.getElementById('body-focus-2').value = selectedBodyFocus;
  })
  .catch(error => {
      console.error('Error:', error);
  });
});

// close the exercise log modal when clicking Workout Done button
document.getElementById('workout-done').addEventListener('click', function() {
  let exerciseLogModalInstance = bootstrap.Modal.getInstance(exerciseLogModal);
  exerciseLogModalInstance.hide();
});
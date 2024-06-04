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
    events: '/log/load',  // route to fetch events from
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
        // Show the Bootstrap modal when a date is clicked
        info.allDay = false;
        selectedDate = info.dateStr;
        let time = new Date().toLocaleTimeString();
        clickedDayElement = info.dayEl;
        console.log(`${selectedDate} is clicked at ${time}`);
        document.getElementById("date").value = formatDate(selectedDate);
        let logModal = new bootstrap.Modal(document.getElementById('log-modal'), { focus: true });
        logModal.show();
    },
    eventClick: function(info) {
      info.jsEvent.preventDefault();
      let event = info.event; // the associated Event Object
      selectedWorkoutId = event.id;
      console.log(event);
      console.log(`selected workout id: ${selectedWorkoutId}`);
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
    selectable: false,
    unselectAuto: true,
    
  })
  calendar.render();

  // Enable log exercise button based on workout type
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

  // Delete workout button
  const deleteWorkoutButton = document.getElementById('delete-workout');
  deleteWorkoutButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to delete this workout?')) {
        deleteWorkout(selectedWorkoutId);
    }
  });
  // Edit workout button
  const editWorkoutButton = document.getElementById('edit-workout');
  editWorkoutButton.addEventListener('click', function() {
  });

});


// Handle form submission in the modal
// Workout submission
document.getElementById('log-form').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent the default form submission behavior

  // Collect form data
  let formData = {
    date: formatDateYMD(document.getElementById('date').value),
    duration_min: document.getElementById('duration-min').value,
    calories_burned: document.getElementById('calories-burned').value,
    workout_name: document.getElementById('workout-name').value,
    workout_type: document.getElementById('workout-type').value,
    body_focus: document.getElementById('body-focus').value
  };
  console.log(JSON.stringify(formData));
  console.log(formData);

  // Use fetch to send the form data
  fetch('/log/add', {
    method: 'POST', 
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
      const newWorkoutId = data.id; // Get the new workout ID from the response
      // Add workout event to calendar
      // TODO: validate input
      if (formData["date"] && formData["duration_min"] && formData["workout_name"]) {
        calendar.addEvent({
            id: newWorkoutId, // Include the new workout ID in the event object
            title: `${formData["duration_min"]} min ${formData["workout_name"]}`,
            start: formData["date"], // Use formData["date"] for the start date
            allDay: true,
        });
      }
    document.getElementById('log-form').reset();
  })
  .catch(error => {
      console.error('Error:', error);
  });



  // Close the modal
  let modalElement = document.getElementById('log-modal');
  let modalInstance = bootstrap.Modal.getInstance(modalElement);
  modalInstance.hide();
  

  // Change the background color of the clicked date
  if (clickedDayElement) {
    clickedDayElement.style.backgroundColor = "rgba(188,232,241,.3)";
  }

});


// autofocus the sets field in exercise log modal
const exerciseLogModal = document.getElementById('exercise-log-modal');
exerciseLogModal.addEventListener('shown.bs.modal', function () {
  const input = document.getElementById('sets');
  input.focus();
});


// Delete workout functions
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
      alert('Workout deleted successfully');
      location.reload(); // Refresh the page to reflect changes
  })
  .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while deleting the workout.');
  });
}


// TODO: edit workout function

import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import 'bootstrap/dist/css/bootstrap.css';
import * as bootstrap from 'bootstrap';
import 'flatpickr/dist/flatpickr.min.css';
import flatpickr from 'flatpickr';
import '../css/styles.css'; // my custom css


console.log("Hello from Webpack and Bootstrap!");

// Initialise global variables
let selectedDate = "";
let clickedDayElement = null;
let calendar;

// Date format function
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Intl.DateTimeFormat('en-GB', options).format(date);
}

// Calendar config
document.addEventListener('DOMContentLoaded', function() {
  // Initialize flatpickr on the date input field
  flatpickr("#date", {
    dateFormat: "j M Y", // Set the desired date format
  });

  const calendarEl = document.getElementById('calendar')
  calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'title',
      center: '',
      right: 'today prev,next' 
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
    selectable: false,
    unselectAuto: true,
  })
  calendar.render();
});


// Handle form submission in the modal
document.getElementById('log-form').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent the default form submission behavior

  // Collect form data
  let formData = {
    date: document.getElementById('date').value,
    duration_min: document.getElementById('duration-min').value,
    calories_burned: document.getElementById('calories-burned').value,
    workout_name: document.getElementById('workout-name').value,
    workout_type: document.getElementById('workout-type').value,
    body_focus: document.getElementById('body-focus').value
  };

  // add workout event to calendar
  if (workoutName && selectedDate && duration) {
    calendar.addEvent({
      title: `${duration} min ${workoutName}`,
      start: selectedDate,
      allDay: true,
    });

    // Close the modal
    let modalElement = document.getElementById('log-modal');
    let modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
  }

  // Change the background color of the clicked date
  if (clickedDayElement) {
    clickedDayElement.style.backgroundColor = "rgba(188,232,241,.3)";
  }

  // Clear the form fields after logging
  document.getElementById('log-form').reset();

});

// Adjust Body Padding 


// autofocus the sets field in exercise log modal
let exerciseLogModal = document.getElementById('exercise-log-modal');
exerciseLogModal.addEventListener('shown.bs.modal', function () {
  let input = document.getElementById('sets');
  input.focus();
});


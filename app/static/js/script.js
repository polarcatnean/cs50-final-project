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
        clickedDayElement = info.dayEl;
        console.log(`${selectedDate} is clicked`);
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

  let workoutName = document.getElementById('workout-name').value;
  let duration = document.getElementById("duration-min").value;
  let workoutType = document.getElementById('workout-type').value;
  let bodyFocus = document.getElementById('body-focus').value;
  let calories = document.getElementById('calories-burned').value;

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

    // Clear the form fields
    document.getElementById('log-form').reset();

});

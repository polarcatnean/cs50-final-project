import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import 'bootstrap/dist/css/bootstrap.css';
import * as bootstrap from 'bootstrap';
import '../css/styles.css'; // my custom css



console.log("Hello from Webpack and Bootstrap!");

// Calendar config
document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar')
  const calendar = new Calendar(calendarEl, {
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
        middleElement.appendChild(progressBar);
    },
    dateClick: function(info) {
        // Trigger the Bootstrap modal
        console.log(`${info.dateStr} is clicked`);
        let logModal = new bootstrap.Modal(document.getElementById('log-modal'), { focus: true });
        logModal.show();
        // if (workout) {
        //     calendar.addEvent({
        //         title: workout,
        //         start: info.dateStr,
        //         allDay: false,
        //     })
        //     info.dayEl.style.backgroundColor = "rgba(188,232,241,.3)";
        // }
    },
    selectable: false,
    unselectAuto: true
  })
  calendar.render();
});



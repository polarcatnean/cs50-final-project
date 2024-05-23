import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';
import '../css/styles.css'; // my custom css
import { right } from '@popperjs/core';


console.log("Hello from Webpack and Bootstrap!");


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
        progressBar.setAttribute('aria-label', 'Basic example');
        progressBar.setAttribute('aria-valuenow', '55');
        progressBar.setAttribute('aria-valuemin', '0');
        progressBar.setAttribute('aria-valuemax', '100');
        progressBar.style = "height: 20px";

        let innerDiv = document.createElement('div');
        innerDiv.className = 'progress-bar progress-bar-striped';
        innerDiv.style = 'width: 55%';
        innerDiv.innerText = '55%';

        progressBar.appendChild(innerDiv);
        middleElement.appendChild(progressBar);
    },
    dateClick: function(info) {
        let workout = prompt("log your workout: ");
        if (workout) {
            calendar.addEvent({
                title: workout,
                start: info.dateStr,
                allDay: false,
            })
            info.dayEl.style.backgroundColor = "rgba(188,232,241,.3)";
        }
    },
    selectable: false,
    unselectAuto: true
  })
  calendar.render();

});



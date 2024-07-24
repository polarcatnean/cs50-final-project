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
let selectedBodyFocus = "";
let exercisesData = [];
let currentExerciseIndex = 0;
let clickedDayElement = null;
let calendar;

const LOG_MODE = 'log';
const EDIT_MODE = 'edit';
const WORKOUT_TYPE = 'workout';
const EXERCISE_TYPE = 'exercise';

let workoutMode = LOG_MODE;
let exerciseMode = LOG_MODE;

// Modal elements for workouts
const workoutModal = document.getElementById('workout-modal');
const workoutModalInstance = new bootstrap.Modal(workoutModal);
const workoutModalHeader = document.getElementById('workout-header');
const workoutForm = document.getElementById('workout-form');
const logExerciseButton = document.getElementById('log-exercise-button');
const saveButton = document.getElementById('save-button');
const workoutTypeElement = document.getElementById('workout-type');

// Modal elements for exercises
const exerciseModal = document.getElementById('exercise-modal');
const exerciseModalInstance = new bootstrap.Modal(exerciseModal);
const exerciseModalHeader = document.getElementById('exercise-header');
const exerciseForm = document.getElementById('exercise-form');
const logMoreButton = document.getElementById('log-more');
const workoutDoneButton = document.getElementById('workout-done');
const deleteExerciseButton = document.getElementById('delete-exercise');

const offcanvasElement = document.getElementById('detail-canvas');
const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);

// Helper functions
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Intl.DateTimeFormat('en-GB', options).format(date);
}

function formatDateYMD(dateStr) {
  // Create a new Date object from the input date string
  const date = new Date(dateStr);
  // Check if the date is valid
  if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
  }
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

function formatDateDMY(dateStr) {
  // Create a new Date object from the input date string
  const date = new Date(dateStr);
  // Check if the date is valid
  if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
  }
  // Format the date as DD-MM-YYYY
  const day = ("0" + date.getDate()).slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function setMode(mode, type) {
  if (type === WORKOUT_TYPE) {
    workoutMode = mode;
    workoutForm.dataset.mode = mode;
    updateWorkoutUI();
  } 
  else if (type === 'exercise') {
    exerciseMode = mode;
    exerciseForm.dataset.mode = mode;
    updateExerciseUI();
  } 
  else {
    console.log("Error: type or mode not set correctly");
  }
  console.log(`setMode to ${mode} for ${type}`);
}

function updateWorkoutUI() {
  const mode = workoutForm.dataset.mode;
  if (mode === LOG_MODE) {
    workoutModalHeader.textContent = 'Log Workout';
    logExerciseButton.textContent = 'Log individual exercise';
    saveButton.textContent = 'Log Workout';
  } else if (mode === EDIT_MODE) {
    workoutModalHeader.textContent = 'Edit Workout';
    logExerciseButton.textContent = 'Edit exercises';
    saveButton.textContent = 'Save changes';
  }
}

function updateExerciseUI() {
  const mode = exerciseForm.dataset.mode;
  if (mode === LOG_MODE) {
    exerciseModalHeader.textContent = `Log exercise #${currentExerciseIndex + 1}`;
    logMoreButton.textContent = 'Log more exercise';
    workoutDoneButton.textContent = 'Workout done!';
    deleteExerciseButton.style.display = 'none';
  } else if (mode === EDIT_MODE) {
    exerciseModalHeader.textContent = `Edit exercise ${currentExerciseIndex + 1}/${exercisesData.length}`;
    logMoreButton.textContent = 'Save & edit next';
    workoutDoneButton.textContent = 'Save all changes';
    deleteExerciseButton.style.display = 'block'; // Show delete button
  }
}

function fetchExerciseOptions(selectedBodyFocus) {
  fetch(`/log/load_exercises?body_focus=${selectedBodyFocus}`)
      .then(response => response.json())
      .then(data => {
          const exerciseSelect = document.getElementById('exercise-id');
          if (exerciseSelect.dataset.value) {
            exerciseSelect.innerHTML = '<option>Select exercise</option>';
          } else {
            exerciseSelect.innerHTML = '<option selected>Select exercise</option>';
          }
          
          data.forEach(exercise => {
              const option = document.createElement('option');
              option.value = exercise.id;
              option.textContent = capitalise(exercise.name);
              exerciseSelect.appendChild(option);
          });

          if (exerciseSelect.dataset.value) {
            exerciseSelect.value = exerciseSelect.dataset.value;
            console.log(`exerciseSelect.dataset.value = ${exerciseSelect.dataset.value}`);
            // console.log(`exerciseSelect.value = ${exerciseSelect.value}`);
            exerciseSelect.dataset.value = "";
          }
      })
      .catch(error => console.error('Error fetching exercises:', error));
}

async function fetchWorkoutDetails(eventId) {
  try {
    const response = await fetch(`/log/details/${eventId}`);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const html = await response.text();

    let workoutDetailsEl = document.getElementById('workout-details');
    workoutDetailsEl.innerHTML = html; // Insert the HTML content
    const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show(); 
  } 
  catch (error) {
    console.error('Error fetching workout details:', error);
  }
}

function toggleLogExerciseBtn() {
  if (workoutTypeElement.value === 'strength') {
    logExerciseButton.removeAttribute('disabled');
    console.log("Enabled Log exercise button");
  } else {
    logExerciseButton.setAttribute('disabled', 'disabled');
    console.log("Disabled Log exercise button");
  }
}

function initExerciseModal() {

  if (selectedBodyFocus === "") {
    selectedBodyFocus = document.getElementById('body-focus-1').value;
    console.log(set)
  }

  if (exerciseMode == LOG_MODE) {
    document.getElementById('body-focus-2').value = selectedBodyFocus;
  }
  
  // init exercise dropdown choices
  fetchExerciseOptions(document.getElementById('body-focus-2').value);
  document.getElementById('sets').focus();
  console.log(`Init dropdown for ${selectedBodyFocus}`);
}

function initWorkoutModal() {
  document.getElementById('duration-min').focus();
  toggleLogExerciseBtn();
  console.log(`Init Workout modal`);
}

function populateExerciseForm() {
  if (currentExerciseIndex < exercisesData.length) {
      const exercise = exercisesData[currentExerciseIndex];
      document.getElementById('body-focus-2').value = exercise.body_focus;
      document.getElementById('exercise-id').dataset.value = exercise.exercise_id;
      document.getElementById('exercise-id').value = exercise.exercise_id;
      document.getElementById('sets').value = exercise.sets;
      document.getElementById('reps').value = exercise.reps;
      document.getElementById('weight').value = exercise.weight;
      updateExerciseUI(); // Update the modal header
  } 
}

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

      // Close the workout-detail offcanvas
      const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
      offcanvasInstance.hide();

      // Remove the event from the calendar
      const event = calendar.getEventById(workoutId);
      if (event) {
        event.remove();
        console.log(`Event with ID ${workoutId} removed from calendar`);
      }
  })
  .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while deleting the workout.');
  });
}

async function deleteExercise(workoutExerciseId) {
  try {
    const deleteExerciseResponse = await fetch(`/log/delete_exercise/${workoutExerciseId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  
    if (!deleteExerciseResponse.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await deleteExerciseResponse.json();
    console.log('Success:', result);

    // Update the UI after successful deletion
    // For example, remove the exercise from the list, close and reopen the OffCanvas, etc.
    // Close the modal if it's open
    const exerciseModalInstance = bootstrap.Modal.getInstance(exerciseModal);
    exerciseModalInstance.hide();
    
    const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
    offcanvasInstance.hide();
    fetchWorkoutDetails(selectedWorkoutId);
    setTimeout(() => {
      offcanvasInstance.show();
    }, 200);

  } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('An error occurred while deleting the exercise. Try again.');
  };
}

function resetVariables() {
  workoutMode = LOG_MODE;
  exerciseMode = LOG_MODE;
  selectedDate = "";
  selectedWorkoutId = "";
  exercisesData = [];
  currentExerciseIndex = 0;
  console.log("Reset mode, exercise form, variables");
}


// After DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialise flatpickr on the date input field
  flatpickr("#date", {
    dateFormat: "d M Y", // Set the desired date format
    disableMobile: "true"
  });

  // Event listeners
  workoutForm.addEventListener('submit', handleFormSubmit);
  exerciseForm.addEventListener('submit', handleFormSubmit);
  exerciseModal.addEventListener('shown.bs.modal', initExerciseModal);
  workoutModal.addEventListener('shown.bs.modal', initWorkoutModal);
  workoutModal.addEventListener('hidden.bs.modal', function () {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  }); // ensures Modal is properly dismissed
  
  document.getElementById('edit-workout').addEventListener('click', handleEditBtn);
  document.getElementById('delete-workout').addEventListener('click', handleDeleteBtn); // Delete button
  document.getElementById('body-focus-2').addEventListener('change', handleBodyFocus2Change); // change for Exercise selector dropdown
  deleteExerciseButton.addEventListener('click', handleDeleteExerciseBtn);
  workoutTypeElement.addEventListener('change', toggleLogExerciseBtn);
  

  // Init Calendar & config
  const calendarEl = document.getElementById('calendar');
  
  calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'title',
      center: '',
      right: 'today prev,next' 
    },
    // defaultView: 'dayGridMonth', // unknown option
    events: '/log/load',  // route to fetch events from
    eventContent: function(info) { // add HTML to event title
      let customHtml = info.event.title; 
      let content = document.createElement('div');
      content.innerHTML = customHtml;
      return { domNodes: [content] };
    },
    // datesSet: function() { // adding progress bar
    //     let middleElement = document.querySelectorAll('.fc-toolbar-chunk')[1];
        
    //     let progressBar = document.createElement("div");
    //     progressBar.className = "progress";
    //     progressBar.role = "progressbar";

    //     let innerDiv = document.createElement('div');
    //     innerDiv.className = 'progress-bar progress-bar-striped';
    //     innerDiv.innerText = '65%';

    //     progressBar.appendChild(innerDiv);
    //     middleElement.innerHTML = "";
    //     middleElement.appendChild(progressBar);
    // },
    dateClick: function(info) {
        info.jsEvent.preventDefault();
        selectedDate = info.dateStr;
        // document.getElementById('date').value = formatDate(selectedDate);
        const flatpickrDate = document.querySelector("#date")._flatpickr;
        flatpickrDate.setDate(formatDate(selectedDate));

        let time = new Date().toLocaleTimeString();
        console.log(`Date cell ${selectedDate} is clicked at ${time}`);

        // Set mode to LOG 
        setMode(LOG_MODE, WORKOUT_TYPE);
        setMode(LOG_MODE, EXERCISE_TYPE);
  
        // Ensure modal is properly shown
        // const workoutModalInstance = new bootstrap.Modal(document.getElementById('workout-modal'));
        workoutModalInstance.show();
    },
    eventClick: function(info) {
      let event = info.event; // the associated Event Object

      selectedWorkoutId = event.id;
      console.log(`selectedWorkoutId: ${selectedWorkoutId}`);

      // Fetch the workout details HTML from the server
      fetchWorkoutDetails(event.id);
    },
  })

  calendar.render();
  // END of calendar config //

}); // END of DOMContentLoaded


async function handleFormSubmit(event) {
  event.preventDefault();

  const clickedButton = event.submitter;
  const formId = event.target.id;

  if (formId === 'workout-form') {
    await submitWorkoutForm(workoutMode);
    workoutModalInstance.hide();

    if (clickedButton.id === 'log-exercise-button') {
      // TODO 
      if (workoutMode == LOG_MODE) {
        workoutForm.reset();
      }
      else if (workoutMode === EDIT_MODE) {
        // account for when workout has no exercises, the fetch will return 404 not found
        try {
          const workoutResponse = await fetch(`/log/fill_workout_data/${selectedWorkoutId}`);
          const workoutData = await workoutResponse.json();
        
          if (workoutData.has_exercises > 0) {
            try {
              const exerciseResponse = await fetch(`/log/fill_exercise_data/${selectedWorkoutId}`);
              const data = await exerciseResponse.json();
              exercisesData = data;
              currentExerciseIndex = 0;
    
              if (exercisesData.length > 0) {
                populateExerciseForm();
                console.log(`Fetched exercise i${currentExerciseIndex}/${exercisesData.length-1}`);
              }
    
            } catch (error) {
              console.error('Error fetching exercise data:', error);
            }
          }
          if (workoutData.has_exercises == 1) {
            logMoreButton.textContent = 'Save changes & add new exercise';
          }
        } catch (error) {
            console.error('Error fetching workout data:', error);
        };
      }
    } 

    else if (clickedButton.id === 'save-button') {
      // TODO handle Save button click

      // Close the workout-detail offcanvas
      const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
      offcanvasInstance.hide();
      
      resetVariables();
    }
  } 

  else if (formId === 'exercise-form') {
    // Handle LOG MORE button
    if (clickedButton.id === 'log-more') {
      submitExerciseForm(exerciseMode)
        .then(() => {
          // After the form submission is handled, close and reopen the modal to show movement
          exerciseModalInstance.hide();
          setTimeout(() => {
            if (exerciseMode === LOG_MODE) {
              setMode(LOG_MODE, EXERCISE_TYPE);
              exerciseForm.reset();
            }
            else if (exerciseMode === EDIT_MODE) {
              populateExerciseForm();
              console.log(`Fetched exercise i${currentExerciseIndex}/${exercisesData.length-1}`);
              // At last exercise to edit
              if (currentExerciseIndex == exercisesData.length - 1) {
                logMoreButton.textContent = 'Save changes & add new exercise';
              }
              if (currentExerciseIndex == exercisesData.length) { // at last exercise 
                setMode(LOG_MODE, EXERCISE_TYPE);
                exerciseForm.reset();
              }
            }
            exerciseModalInstance.show();
          }, 200); // Adjust the delay for visual effect
        })
        .catch(error => {
          console.error('Error during form submission:', error);
        });
    }
    else if (clickedButton.id === 'workout-done') {
      submitExerciseForm(exerciseMode)
        .then(() => {
          exerciseForm.reset();
          exerciseModalInstance.hide();

          // TODO
          if (exerciseMode === LOG_MODE) {
            
          }
          else if (exerciseMode === EDIT_MODE) {

          }

          // Fetch the new workout details
          fetchWorkoutDetails(selectedWorkoutId);
          // Hide and then show the offcanvas with updated details
          const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
          offcanvasInstance.hide();
          setTimeout(() => {
            offcanvasInstance.show();
          }, 200); // Delay to ensure the offcanvas is hidden before showing it again
        })
        .then(() => {
          // resetVariables(); // commented out because of bug (after submitting edits, the edit workout becomes unusable
                               // reset only after the OffCanvas is hidden?
        })
        .catch(error => {
          console.error('Error during form submission:', error);
        });
    }
  }
}

// TODO
function submitWorkoutForm(workoutMode) {
  return new Promise((resolve, reject) => {
  
    const url = workoutMode === LOG_MODE ? '/log/add' : `/log/edit_workout/${selectedWorkoutId}`;
    const method = workoutMode === LOG_MODE ? 'POST' : 'PUT';

    const workoutData = {
      date: formatDateYMD(document.getElementById('date').value),
      duration_min: document.getElementById('duration-min').value,
      calories_burned: document.getElementById('calories-burned').value,
      workout_name: document.getElementById('workout-name').value,
      workout_type: document.getElementById('workout-type').value,
      body_focus: document.getElementById('body-focus-1').value
    }

    console.log(`Submitting workout form in ${workoutMode}`);
    console.log('Workout data:', workoutData);

    fetch(url, {
      method: method,
      headers : {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workoutData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Success:', data);
        // Handle success (e.g., close modal, update UI, etc.)
        // Get the new workout ID from the response
        selectedWorkoutId = data.id; 

        // Set event background colour
        let bodyFocusClass = workoutData["workout_type"] === "cardio" ? "focus-cardio" : `focus-${workoutData["body_focus"]}`;

        // Update calendar
        if (workoutData["date"] && workoutData["duration_min"] && workoutData["workout_name"]) {
          if (workoutMode === LOG_MODE) {
            // Add event to calendar
            calendar.addEvent({
              id: selectedWorkoutId, // Include the new workout ID in the event object
              title: `<b>${workoutData["duration_min"]} min</b><br>${workoutData["workout_name"]}`,
              start: workoutData["date"],
              allDay: true,
              classNames: [bodyFocusClass],
              extendedProps: {
                duration: workoutData["duration_min"],
                workoutName: workoutData["workout_name"]
              },
            });
            console.log("Event added to calendar");
          }
          else if (workoutMode === EDIT_MODE) {
            // Update the existing event on calendar after editing
            const event = calendar.getEventById(selectedWorkoutId);
            if (event) {
              event.setProp('title', `<b>${workoutData["duration_min"]} min</b><br>${workoutData["workout_name"]}`);
              event.setStart(workoutData["date"]);
              event.setExtendedProp('duration', workoutData["duration_min"]);
              event.setExtendedProp('workoutName', workoutData["workout_name"]);
              event.setProp('classNames', [bodyFocusClass]);
              console.log("Event updated on calendar");
            }
          }

        selectedBodyFocus = document.getElementById('body-focus-1').value; // to use later in exercise modal
        workoutForm.reset();
        
        // Ensure modal instance is properly hidden
        const modalInstance = bootstrap.Modal.getInstance(workoutModal);
        modalInstance.hide();
        resolve();
        }
      })
      .catch(error => {
        console.error('Error:', error);
        reject(error);
      });
  });
}

function submitExerciseForm(exerciseMode) {
  return new Promise((resolve, reject) => {

    const url = exerciseMode === LOG_MODE ? '/log/add_exercise' : `/log/edit_exercise/${exercisesData[currentExerciseIndex].id}`;
    const method = exerciseMode === LOG_MODE ? 'POST' : 'PUT';
    
    let exerciseData = {
      workout_id: selectedWorkoutId,
      exercise_id: document.getElementById('exercise-id').value,
      sets: document.getElementById('sets').value,
      reps: document.getElementById('reps').value,
      weight: parseFloat(document.getElementById('weight').value).toFixed(2)
    };

    console.log(`Submitting exercise form in ${exerciseMode} | WorkoutId: ${selectedWorkoutId}`);
    console.log('Exercise data:', exerciseData);

    fetch(url, {
      method: method,
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
        // Handle success
        if (exerciseMode === LOG_MODE) {
          currentExerciseIndex++;
        }
        else if (exerciseMode === EDIT_MODE) {
          currentExerciseIndex++;
          // populateExerciseForm();
          
          console.log(`currentExerciseIndex=${currentExerciseIndex}`);
          console.log(`exercisesData.length=${exercisesData.length}`);

          // At last exercise to edit
          if (currentExerciseIndex == exercisesData.length - 1) {
            logMoreButton.textContent = 'Save changes & add new exercise';
          }
        } 
        resolve();
      })
      .catch(error => {
        console.error('Error:', error);
        reject(error);
      });
  });
}

function handleEditBtn() {
  setMode(EDIT_MODE, WORKOUT_TYPE);
  setMode(EDIT_MODE, EXERCISE_TYPE);

  fetch(`/log/fill_workout_data/${selectedWorkoutId}`)
    .then(response => response.json())
    .then(data => {
        // Populate the form with existing workout data
        document.getElementById('date').value = formatDate(data.date);
        document.getElementById('duration-min').value = data.duration_min;
        document.getElementById('calories-burned').value = data.calories_burned || '';
        document.getElementById('workout-name').value = data.workout_name;
        document.getElementById('workout-type').value = data.workout_type;
        document.getElementById('body-focus-1').value = data.body_focus;

        if (data.has_exercises == 0) {
          console.log("Workout has no recorded exercises, changing mode for exercise")
          setMode(LOG_MODE, EXERCISE_TYPE)
          logExerciseButton.textContent = "Add exercise";
          selectedBodyFocus = document.getElementById('body-focus-1').value;
        }

        workoutModalInstance.show();
    })
    .catch(error => {
        console.error('Error fetching workout details:', error);
    });

}

function handleDeleteBtn() {
  if (confirm('Are you sure you want to delete this workout and its associated exercises?')) {
    deleteWorkout(selectedWorkoutId);
  }
}

function handleDeleteExerciseBtn() {
  if (confirm('Delete this exercise?')) {
    let workoutExerciseId = exercisesData[currentExerciseIndex].id;
    deleteExercise(workoutExerciseId);
  }
}

function handleBodyFocus2Change(event) {
  selectedBodyFocus = event.target.value;
  fetchExerciseOptions(selectedBodyFocus);
  console.log(`Fetched exercise options for ${selectedBodyFocus}`);
}




let statsData = {};
let exerciseRatioChart;
let bodyDaysChart;

document.addEventListener('DOMContentLoaded', () => {
    const monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    let currentDate = new Date();

    const currentMonthDisplay = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const thisMonthBtn = document.getElementById('this-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn')


    // Function to fetch and display stats
    function fetchAndDisplayStats(year, month) {
        const YYYYMM = `${year}${String(month).padStart(2, '0')}`;
        currentMonthDisplay.textContent = `${monthNames[month - 1]} ${year}`;

        fetch(`/log/get_monthly_stats/${YYYYMM}`, {
            method: 'GET',
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
            
            statsData = {
                exerciseDays: data.exerciseDays,
                cardioDays: data.cardioDays,
                fullBodyDays : data.fullBodyDays,
                upperBodyDays: data.upperBodyDays,
                lowerBodyDays: data.lowerBodyDays,
                strengthDays: data.strengthDays,
                yogaDays : data.yogaDays
                // yogaDays : data.yogaDays > 0 ? data.yogaDays : 'none'
            };

            document.getElementById('exercise-days').textContent = statsData.exerciseDays;
            document.getElementById('cardio-days').textContent = statsData.cardioDays;
            document.getElementById('strength-days').textContent = statsData.strengthDays;
            document.getElementById('full-body-days').textContent = statsData.fullBodyDays;
            document.getElementById('upper-body-days').textContent = statsData.upperBodyDays;
            document.getElementById('lower-body-days').textContent = statsData.lowerBodyDays;
            document.getElementById('yoga-days').textContent = statsData.yogaDays;

            // Workout type ratios
            const totalDays = statsData.exerciseDays;
            const cardioRatio = (statsData.cardioDays / totalDays) * 100;
            const strengthRatio = (statsData.strengthDays / totalDays) * 100;
            const yogaRatio = (statsData.yogaDays / totalDays) * 100;
            
            // Body focus ratios
            const fullBodyRatio = (statsData.fullBodyDays / totalDays) * 100;
            const upperBodyRatio = (statsData.upperBodyDays / totalDays) * 100;
            const lowerBodyRatio = (statsData.lowerBodyDays / totalDays) * 100;

            createChart(cardioRatio, strengthRatio, yogaRatio);
            createBodyDaysChart(fullBodyRatio, upperBodyRatio, lowerBodyRatio);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while fetching stats.');
        });
    }

    // Fetch initial stats for current month and year
    fetchAndDisplayStats(currentDate.getFullYear(), currentDate.getMonth() + 1);

    // Handle previous month button click
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        fetchAndDisplayStats(currentDate.getFullYear(), currentDate.getMonth() + 1);
    });

    // Handle this month button click
    thisMonthBtn.addEventListener('click', () => {
        fetchAndDisplayStats(currentDate.getFullYear(), currentDate.getMonth() + 1);
    });

    // Handle next month button click
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        fetchAndDisplayStats(currentDate.getFullYear(), currentDate.getMonth() + 1);
    });
});


function createChart(cardioRatio, strengthRatio, yogaRatio) {
    const ctx = document.getElementById('exercise-ratio-chart').getContext('2d');

    // Destroy existing chart instance if it exists
    if (exerciseRatioChart) {
        exerciseRatioChart.destroy();
    }

    exerciseRatioChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Cardio', 'Strength Training', 'Yoga'],
            datasets: [{
                label: 'Exercise Ratio',
                data: [cardioRatio, strengthRatio, yogaRatio],
                backgroundColor: [
                    'rgba(245, 179, 176, 0.4)',
                    'rgba(216, 172, 200, 0.4)',
                    'rgba(149, 161, 226, 0.4)'
                ],
                borderColor: [
                    'rgba(245, 179, 176, 1)',
                    'rgba(216, 172, 200, 1)',
                    'rgba(149, 161, 226, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    bottom: 0,
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'center',
                    labels: {
                        padding: 10,
                        boxWidth: 20,
                        // color: 'white'
                    }
                },
                title: {
                    display: false,
                    text: 'Exercise Type Ratio'
                }
            }
        }
    });
}

function createBodyDaysChart(fullBodyRatio, upperBodyRatio, lowerBodyRatio) {
    const ctx = document.getElementById('body-days-chart').getContext('2d');

    // Destroy existing chart instance if it exists
    if (bodyDaysChart) {
        bodyDaysChart.destroy();
    }

    bodyDaysChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Full Body Days', 'Upper Body Days', 'Lower Body Days'],
            datasets: [{
                label: 'Body Days Ratio',
                data: [fullBodyRatio, upperBodyRatio, lowerBodyRatio],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.4)',
                    'rgba(54, 162, 235, 0.4)',
                    'rgba(75, 192, 192, 0.4)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    bottom: 0,
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'center',
                    labels: {
                        padding: 10,
                        boxWidth: 20,
                    }
                },
                title: {
                    display: false,
                    text: 'Body Days Ratio'
                }
            }
        }
    });
}

let statsData = {};

document.addEventListener('DOMContentLoaded', () => {
    const monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Get month and pad with leading zero if needed
    const year = now.getFullYear();
    const currentMonth = `${monthNames[now.getMonth()]} ${year}`;
    const YYYYMM = `${year}${month}`;

    document.getElementById('current-month').textContent = currentMonth;

    // get data
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
            upperBodyDays: data.upperBodyDays,
            lowerBodyDays: data.lowerBodyDays,
            strengthDays: data.strengthDays,
            yogaDays : data.yogaDays
            // yogaDays : data.yogaDays > 0 ? data.yogaDays : 'none'
        };

        document.getElementById('exercise-days').textContent = statsData.exerciseDays;
        document.getElementById('cardio-days').textContent = statsData.cardioDays;
        document.getElementById('strength-days').textContent = statsData.strengthDays;
        // if (statsData.yogaDays > 0) {
        //     document.getElementById('yoga-days').textContent = statsData.yogaDays;
        // } else {
        //     document.getElementById('yoga-card').style.display = 'none';
        // }

        const totalDays = statsData.exerciseDays;
        const cardioRatio = (statsData.cardioDays / totalDays) * 100;
        const strengthRatio = (statsData.strengthDays / totalDays) * 100;
        const yogaRatio = (statsData.yogaDays / totalDays) * 100;
        
        createChart(cardioRatio, strengthRatio, yogaRatio);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while fetching stats.');
    });
});


function createChart(cardioRatio, strengthRatio, yogaRatio) {
    const ctx = document.getElementById('exercise-ratio-chart').getContext('2d');
    const exerciseRatioChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Cardio', 'Strength Training', 'Yoga'],
            datasets: [{
                label: '%',
                data: [cardioRatio, strengthRatio, yogaRatio],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Exercise Type'
                }
            }
        }
    });
}
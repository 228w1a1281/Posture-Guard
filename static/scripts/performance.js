/* static/performance_analysis.js */

// Function to fetch alert data from the server
async function fetchAlertData() {
    try {
        // Mock data if the API is not ready or for initial testing
        const data = [
            { hour: '08:00', green: 19, red: 12, blue: 9, black: 6  },
            { hour: '09:00', green: 10, red: 13, blue: 2, black: 11 },
            { hour: '10:00', green: 13, red: 19, blue: 7, black: 2},
            { hour: '11:00', green: 20, red: 8, blue: 13, black: 6 },
            { hour: '12:00', green: 24, red: 9, blue: 3, black: 2 },
            { hour: '13:00', green: 11, red: 9, blue: 12, black: 4 },
            { hour: '14:00', green: 15, red: 9, blue: 9, black: 8 }

        ];

        // If using real data from the server, uncomment the following lines
        // const response = await fetch('/api/alerts');
        // const data = await response.json();

        // Parse data for chart.js
        const labels = data.map(entry => entry.hour); // Hour of the day
        const greenAlerts = data.map(entry => entry.green);
        const redAlerts = data.map(entry => entry.red);
        const blueAlerts = data.map(entry => entry.blue);
        const blackAlerts = data.map(entry => entry.black);

        // Render the chart using Chart.js
        const ctx = document.getElementById('alertChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Green (Good)',
                        data: greenAlerts,
                        borderColor: 'green',
                        fill: false,
                    },
                    {
                        label: 'Red (Bad)',
                        data: redAlerts,
                        borderColor: 'red',
                        fill: false,
                    },
                    {
                        label: 'Blue (Lean Forward)',
                        data: blueAlerts,
                        borderColor: 'blue',
                        fill: false,
                    },
                    {
                        label: 'Black (Lean Back)',
                        data: blackAlerts,
                        borderColor: 'black',
                        fill: false,
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'category',
                        title: {
                            display: true,
                            text: 'Hour of Day'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Count of Alerts'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching alert data:', error);
    }
}

// Call the function to render the graph initially
fetchAlertData();

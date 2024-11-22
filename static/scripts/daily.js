document.addEventListener('DOMContentLoaded', () => {   
    const mockData = [
        { Date: '20-10-24', green: 19, red: 12, blue: 9, black: 6 },
        { Date: '19-10-24', green: 10, red: 13, blue: 2, black: 11 },
        { Date: '18-10-24', green: 33, red: 11, blue: 2, black: 2 },
        { Date: '17-10-24', green: 15, red: 29, blue: 6, black: 6 },
        { Date: '16-10-24', green: 28, red: 13, blue: 3, black: 2 },
        { Date: '15-10-24', green: 12, red: 18, blue: 2, black: 14 },
        { Date: '14-10-24', green: 25, red: 12, blue: 9, black: 8 }
    ];

    populateTable(mockData); // Initial population of the table

    // Add event listener for the filter button
    document.getElementById('filterButton').addEventListener('click', () => {
        const inputDate = document.getElementById('dateInput').value;
        const formattedDate = formatDate(inputDate);
        const filteredData = mockData.filter(entry => entry.Date === formattedDate);
        populateTable(filteredData);
    });

    // Add event listener for the back button
    document.getElementById('backButton').addEventListener('click', () => {
        populateTable(mockData); // Reset to show all data
        document.getElementById('dateInput').value = ''; // Clear the date input
    });
});

// Function to format the date input from the date picker
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year
    return `${day}-${month}-${year}`; // Return in 'dd-mm-yy' format
}

function populateTable(data) {
    const tableBody = document.querySelector('#summaryTable tbody');
    tableBody.innerHTML = '';  // Clear the table body

    // Loop through each entry in the filtered data
    data.forEach(entry => {
        const row = document.createElement('tr');

        // Create table cells for the date and alert counts
        const dateCell = createCell(entry.Date);
        const greenAlertsCell = createCell(entry.green);
        const redAlertsCell = createCell(entry.red);
        const blueAlertsCell = createCell(entry.blue);
        const blackAlertsCell = createCell(entry.black);

        // Classify as High Alert or Normal based on the condition
        const totalBadAlerts = entry.red + entry.blue + entry.black;
        const analysisCell = createCell(totalBadAlerts > entry.green ? "High Alert" : "Normal");

        // Append cells to the row
        row.appendChild(dateCell);
        row.appendChild(greenAlertsCell);
        row.appendChild(redAlertsCell);
        row.appendChild(blueAlertsCell);
        row.appendChild(blackAlertsCell);
        row.appendChild(analysisCell); // Append the analysis cell

        // Append the row to the table
        tableBody.appendChild(row);
    });
}

function createCell(text) {
    const cell = document.createElement('td');
    cell.textContent = text;
    return cell;
}

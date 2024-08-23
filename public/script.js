document.getElementById('rateForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const zipCode = document.getElementById('zipCode').value;
    const shipmentWeight = document.getElementById('shipmentWeight').value;
    const resultContainer = document.getElementById('result');
    const errorContainer = document.getElementById('error');
    const linehaulSpan = document.getElementById('linehaul');
    const fscSpan = document.getElementById('fsc');
    const totalRateSpan = document.getElementById('totalRate');

    const logEntry = {
        date: new Date().toISOString(),
        zipCode: zipCode,
        shipmentWeight: parseFloat(shipmentWeight),
        // IP is handled server-side
    };

    fetch('/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(logEntry)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Log saved successfully') {
            // Display the breakdown of linehaul, FSC, and total rate
            linehaulSpan.textContent = data.linehaul.toFixed(2);
            fscSpan.textContent = data.fsc.toFixed(2);
            totalRateSpan.textContent = data.totalRate.toFixed(2);

            resultContainer.style.display = 'block';
            errorContainer.style.display = 'none';
        } else {
            resultContainer.style.display = 'none';
            errorContainer.textContent = 'Error calculating rate. Please try again.';
            errorContainer.style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        resultContainer.style.display = 'none';
        errorContainer.textContent = 'Error calculating rate. Please try again.';
        errorContainer.style.display = 'block';
    });
});

// Fetch logs and display them in the table with pagination
let currentPage = 1;
const recordsPerPage = 10;
let logs = [];

async function fetchLogs() {
    try {
        const response = await fetch('/logs');
        logs = await response.json();
        displayLogs();
    } catch (err) {
        console.error('Error fetching logs:', err);
    }
}

function displayLogs() {
    const logTableBody = document.getElementById('log-table-body');
    logTableBody.innerHTML = ''; // Clear existing logs

    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    const paginatedLogs = logs.slice(start, end);

    paginatedLogs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(log.date).toLocaleString()}</td>
            <td>${log.zip_code}</td>
            <td>${log.shipment_weight}</td>
            <td>${log.zone}</td>
            <td>${log.linehaul}</td>
            <td>${log.fsc}</td>
            <td>${log.total_rate}</td>
        `;
        logTableBody.appendChild(row);
    });

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(logs.length / recordsPerPage);
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.disabled = i === currentPage;
        button.addEventListener('click', () => {
            currentPage = i;
            displayLogs();
        });
        paginationContainer.appendChild(button);
    }
}

// Toggle the visibility of the logs table
document.getElementById('toggleLogsButton').addEventListener('click', function () {
    const logTableContainer = document.getElementById('log-table-container');
    if (logTableContainer.style.display === 'none' || logTableContainer.style.display === '') {
        fetchLogs(); // Fetch the logs when the button is clicked
        logTableContainer.style.display = 'block';
        this.textContent = 'Hide Rating Logs';
    } else {
        logTableContainer.style.display = 'none';
        this.textContent = 'Show Rating Logs';
    }
});

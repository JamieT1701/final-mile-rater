// Function to handle rate calculation form submission
document.getElementById('rateForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const zipCode = document.getElementById('zipCode').value;
    const shipmentWeight = document.getElementById('shipmentWeight').value;
    const resultContainer = document.getElementById('result');
    const errorContainer = document.getElementById('error');
    const linehaulSpan = document.getElementById('linehaul');
    const fscSpan = document.getElementById('fsc');
    const totalRateSpan = document.getElementById('totalRate');

    // Prepare the log entry data to send to the server
    const logEntry = {
        date: new Date().toISOString(),
        zipCode: zipCode,
        shipmentWeight: parseFloat(shipmentWeight)
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

// Function to fetch and display logs
async function fetchLogs() {
    try {
        const response = await fetch('/logs');
        const logs = await response.json();

        const logTableBody = document.getElementById('log-table-body');
        logTableBody.innerHTML = ''; // Clear existing logs

        logs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(log.date).toLocaleString()}</td>
                <td>${log.zip_code}</td>
                <td>${log.shipment_weight}</td>
                <td>${log.zone}</td>
                <td>$${log.linehaul.toFixed(2)}</td>
                <td>$${log.fsc.toFixed(2)}</td>
                <td>$${log.total_rate.toFixed(2)}</td>
            `;
            logTableBody.appendChild(row);
        });
    } catch (err) {
        console.error('Error fetching logs:', err);
    }
}

document.addEventListener('DOMContentLoaded', fetchLogs);

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
                <td>${log.linehaul}</td>
                <td>${log.fsc}</td>
                <td>${log.total_rate}</td>
            `;
            logTableBody.appendChild(row);
        });

        // Implement pagination if needed (e.g., if there are many logs)
        updatePagination(logs);
    } catch (err) {
        console.error('Error fetching logs:', err);
    }
}

function updatePagination(logs) {
    // Add pagination logic here, similar to what we discussed earlier
}

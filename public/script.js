document.getElementById('rateForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const zipCode = document.getElementById('zipCode').value;
    const shipmentWeight = document.getElementById('shipmentWeight').value;
    const resultDiv = document.getElementById('result');
    
    const logEntry = {
        date: new Date().toLocaleString(),
        zipCode: zipCode,
        shipmentWeight: shipmentWeight,
        rate: calculateRate(zipCode, shipmentWeight), // Placeholder for the rate calculation logic
        error: null,
        ip: "Unknown" // In a production app, you'd get the IP from the server or an external service
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
            resultDiv.textContent = `The calculated rate is $${logEntry.rate}.`;
            resultDiv.style.display = 'block';
        } else {
            resultDiv.textContent = 'There was an issue saving the log data.';
            resultDiv.style.display = 'block';
            resultDiv.style.backgroundColor = '#f8d7da';
            resultDiv.style.color = '#721c24';
        }
    })
    .catch(error => {
        console.error('Error logging data:', error);
        resultDiv.textContent = 'An error occurred while calculating the rate.';
        resultDiv.style.display = 'block';
        resultDiv.style.backgroundColor = '#f8d7da';
        resultDiv.style.color = '#721c24';
    });
});

document.getElementById('clearButton').addEventListener('click', function() {
    document.getElementById('rateForm').reset();
    document.getElementById('result').style.display = 'none';
});

// Placeholder for rate calculation logic
function calculateRate(zipCode, weight) {
    // In a real app, this would include logic based on your pricing matrix.
    // For simplicity, let's return a static rate.
    return 100;
}

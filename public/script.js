document.getElementById('rateForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const zipCode = document.getElementById('zipCode').value;
    const shipmentWeight = document.getElementById('shipmentWeight').value;
    const resultDiv = document.getElementById('result');

    const logEntry = {
        date: new Date().toISOString(),
        zipCode: zipCode,
        shipmentWeight: parseFloat(shipmentWeight),
        ip: "127.0.0.1" // You can leave this as a placeholder; it will be replaced by the server
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
            resultDiv.textContent = `$${data.rate.toFixed(2)}`;
            resultDiv.style.display = 'block';
        } else {
            resultDiv.textContent = 'Error calculating rate. Please try again.';
            resultDiv.style.display = 'block';
            resultDiv.style.color = 'red';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        resultDiv.textContent = 'Error calculating rate. Please try again.';
        resultDiv.style.display = 'block';
        resultDiv.style.color = 'red';
    });
});

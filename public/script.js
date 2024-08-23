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
      ip: "127.0.0.1" // You can update this to fetch the real IP
    };
  
    fetch('/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(logEntry)
    })
      .then((response) => response.json())
      .then((data) => {
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
      .catch((error) => {
        console.error('Error:', error);
        resultContainer.style.display = 'none';
        errorContainer.textContent = 'Error calculating rate. Please try again.';
        errorContainer.style.display = 'block';
      });
  });
  
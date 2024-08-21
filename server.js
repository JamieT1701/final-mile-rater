const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" directory

// Define the /log route
app.post('/log', (req, res) => {
  console.log('POST /log route hit');
  const logEntry = req.body;

  const logText = `${logEntry.date} - IP: ${logEntry.ip} - Zip Code: ${logEntry.zipCode} - Weight: ${logEntry.shipmentWeight} - Rate: ${logEntry.rate} - Error: ${logEntry.error}\n`;

  fs.appendFile('rating_log.txt', logText, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
      return res.status(500).json({ message: 'Error saving log data' });
    }
    return res.status(200).json({ message: 'Log saved successfully' });
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

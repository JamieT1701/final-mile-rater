const express = require('express');
const { Pool } = require('pg'); // Import the PostgreSQL client
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection using the DATABASE_URL environment variable set by Heroku
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // This is necessary for Heroku's managed Postgres
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create the logs table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    date TIMESTAMPTZ NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    shipment_weight INTEGER NOT NULL,
    rate NUMERIC(10, 2) NOT NULL,
    error TEXT,
    ip VARCHAR(50)
  );
`, (err) => {
  if (err) {
    console.error('Error creating logs table:', err);
  } else {
    console.log('Logs table is ready');
  }
});

// Define the /log route
app.post('/log', async (req, res) => {
  try {
    const { date, zipCode, shipmentWeight, rate, error, ip } = req.body;

    // Insert the log entry into the database
    await pool.query(
      'INSERT INTO logs (date, zip_code, shipment_weight, rate, error, ip) VALUES ($1, $2, $3, $4, $5, $6)',
      [date, zipCode, shipmentWeight, rate, error, ip]
    );

    res.status(200).json({ message: 'Log saved successfully' });
  } catch (err) {
    console.error('Error saving log data:', err);
    res.status(500).json({ message: 'Error saving log data' });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

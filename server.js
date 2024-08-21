const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const axios = require('axios'); // Use axios to fetch the API
const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Function to get the national diesel price from the API
async function getDieselPrice() {
  try {
    const response = await axios.get('https://api.eia.gov/v2/petroleum/pri/gnd/data/?frequency=weekly&data[0]=value&facets[series][]=EMD_EPD2D_PTE_NUS_DPG&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=5000');
    // Extract the most recent diesel price
    const dieselPrice = response.data.response.data[0].value;
    return dieselPrice;
  } catch (error) {
    console.error('Error fetching diesel price:', error);
    return null; // Return null if there’s an issue
  }
}

// Function to calculate the FSC based on the diesel price
function calculateFSC(dieselPrice) {
  if (dieselPrice <= 3.25) return 0; // No FSC if price is $3.25 or below
  const increments = Math.floor((dieselPrice - 3.25) / 0.25); // Calculate the number of $0.25 increments above $3.25
  return increments * 2.5; // FSC increases by 2.5% for each $0.25 increment
}

// Function to get the zone based on zip code
async function getZoneByZipCode(zipCode) {
  try {
    const result = await pool.query(
      'SELECT zone FROM zip_to_zone WHERE zip_code = $1',
      [zipCode]
    );
    if (result.rows.length > 0) {
      return result.rows[0].zone;
    } else {
      return null; // Return null if no zone is found for the given zip code
    }
  } catch (err) {
    console.error('Error fetching zone:', err);
    return null;
  }
}

// Function to calculate the rate based on zone and weight, and apply the FSC
async function calculateRate(zipCode, weight) {
  const zone = await getZoneByZipCode(zipCode);
  if (!zone) return null; // Return null if no zone is found

  try {
    const result = await pool.query(
      'SELECT rate FROM pricing_matrix WHERE zone = $1 AND weight_min <= $2 AND weight_max >= $2',
      [zone, weight]
    );
    if (result.rows.length > 0) {
      const baseRate = result.rows[0].rate;
      const dieselPrice = await getDieselPrice();
      if (dieselPrice === null) {
        console.error('Unable to fetch diesel price. FSC cannot be applied.');
        return baseRate; // Return the base rate if the diesel price cannot be fetched
      }
      const fscPercentage = calculateFSC(dieselPrice);
      const fscAmount = (baseRate * fscPercentage) / 100;
      return baseRate + fscAmount; // Return the rate with FSC applied
    } else {
      return null; // Return null if no matching rate is found
    }
  } catch (err) {
    console.error('Error fetching rate:', err);
    return null;
  }
}

// Define the /log route with dynamic rate calculation including FSC
app.post('/log', async (req, res) => {
  const { date, zipCode, shipmentWeight, ip } = req.body;
  let rate = await calculateRate(zipCode, shipmentWeight);

  if (rate === null) {
    rate = 'N/A'; // Handle cases where no rate is found
  }

  const logEntry = {
    date,
    zipCode,
    shipmentWeight,
    rate,
    error: rate === 'N/A' ? 'No rate found for given zone and weight' : null,
    ip
  };

  // Insert the log entry into the database
  try {
    await pool.query(
      'INSERT INTO logs (date, zip_code, shipment_weight, rate, error, ip) VALUES ($1, $2, $3, $4, $5, $6)',
      [logEntry.date, logEntry.zipCode, logEntry.shipmentWeight, logEntry.rate, logEntry.error, logEntry.ip]
    );
    res.status(200).json({ message: 'Log saved successfully', rate: logEntry.rate });
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

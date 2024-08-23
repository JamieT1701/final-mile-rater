const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(express.json());
app.use(express.static('public'));

// Trust the proxy to get the real IP address from the X-Forwarded-For header
app.set('trust proxy', true);

// Function to get the national diesel price from the API
async function getDieselPrice() {
  try {
    const response = await axios.get('https://api.eia.gov/v2/petroleum/pri/gnd/data/?frequency=weekly&data[0]=value&facets[series][]=EMD_EPD2D_PTE_NUS_DPG&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=5000&api_key=skeZaLa1T8axibuDLl5lo9W7hD08lsudhyHneZvc');
    if (response.data && response.data.error) {
      console.error('API Error:', response.data.error);
      return null;
    }
    const dieselPrice = response.data.response.data[0].value;
    console.log('Fetched Diesel Price:', dieselPrice); // Log the fetched diesel price
    return dieselPrice;
  } catch (error) {
    console.error('Error fetching diesel price:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Function to calculate the fuel surcharge (FSC)
function calculateFSC(dieselPrice) {
  if (dieselPrice <= 3.25) return 0;
  const increments = Math.floor((dieselPrice - 3.25) / 0.25);
  const fscPercentage = increments * 2.5;
  console.log(`FSC Calculation -> Diesel Price: ${dieselPrice}, Increments: ${increments}, FSC Percentage: ${fscPercentage}%`); // Log FSC calculation details
  return fscPercentage;
}

// Function to calculate the rate based on the zip code and weight
async function calculateRate(zipCode, weight) {
  const zone = await getZoneByZipCode(zipCode);
  if (!zone) return null;

  try {
    const result = await pool.query(
      'SELECT rate FROM pricing_matrix WHERE zone = $1 AND weight_min <= $2 AND weight_max >= $2',
      [zone, weight]
    );
    if (result.rows.length > 0) {
      const baseRate = parseFloat(result.rows[0].rate);
      const dieselPrice = await getDieselPrice();
      if (dieselPrice === null) {
        console.error('Unable to fetch diesel price. FSC cannot be applied.');
        return { linehaul: baseRate, fsc: 0, totalRate: baseRate };
      }
      const fscPercentage = calculateFSC(dieselPrice);
      const fscAmount = parseFloat(((baseRate * fscPercentage) / 100).toFixed(2));
      const totalRate = parseFloat((baseRate + fscAmount).toFixed(2));

      console.log(`Final Rate Calculation -> Base Rate: $${baseRate}, FSC Amount: $${fscAmount}, Total Rate: $${totalRate}`); // Log final rate details
      return { linehaul: baseRate, fsc: fscAmount, totalRate: totalRate };
    } else {
      return null;
    }
  } catch (err) {
    console.error('Error fetching rate:', err);
    return null;
  }
}

// POST route to log calculation and return rate details
app.post('/log', async (req, res) => {
  const { date, zipCode, shipmentWeight } = req.body;

  // Extract the real IP address from the X-Forwarded-For header
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Validate and parse the shipmentWeight to ensure it's numeric
  const validShipmentWeight = parseFloat(shipmentWeight);
  if (isNaN(validShipmentWeight)) {
    console.error('Invalid shipment weight:', shipmentWeight);
    return res.status(400).json({ message: 'Invalid shipment weight' });
  }

  const rateDetails = await calculateRate(zipCode, validShipmentWeight);

  if (rateDetails === null) {
    return res.status(200).json({
      message: 'Error calculating rate',
    });
  }

  // Log the values before the database insert
  console.log('Logging data:', {
    date,
    zipCode,
    shipmentWeight: validShipmentWeight,
    totalRate: rateDetails.totalRate,
    ip
  });

  try {
    await pool.query(
      'INSERT INTO logs (date, zip_code, shipment_weight, rate, error, ip) VALUES ($1, $2, $3, $4, $5, $6)',
      [date, zipCode, validShipmentWeight, rateDetails.totalRate, null, ip]
    );
    res.status(200).json({
      message: 'Log saved successfully',
      linehaul: rateDetails.linehaul,
      fsc: rateDetails.fsc,
      totalRate: rateDetails.totalRate
    });
  } catch (err) {
    console.error('Error saving log data:', err);
    res.status(500).json({ message: 'Error saving log data' });
  }
});

// GET route to fetch logs
app.get('/logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM logs ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ message: 'Error fetching logs' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

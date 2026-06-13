const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Test koneksi database
app.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1');
    res.json({ status: 'OK', message: 'Database terhubung!' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3030;

app.use(cors());
app.use(require('body-parser').urlencoded({ extended: false }));

// Load JSON data
const reviews_data = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'reviews.json'), 'utf8')
);

const dealerships_data = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'dealerships.json'), 'utf8')
);

// Load car makes and models
// Corrected filename: car_records.json
const cars_data = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'car_records.json'), 'utf8')
);

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/', {
  dbName: 'dealershipsDB'
});

const Reviews = require('./review');
const Dealerships = require('./dealership');

// Load data into MongoDB after connecting
mongoose.connection.once('open', async () => {
  try {
    await Reviews.deleteMany({});
    await Reviews.insertMany(reviews_data.reviews);

    await Dealerships.deleteMany({});
    await Dealerships.insertMany(dealerships_data.dealerships);

    console.log('Reviews and dealerships loaded successfully.');
  } catch (error) {
    console.error('Error loading database data:', error);
  }
});

// Home endpoint
app.get('/', async (req, res) => {
  res.send('Welcome to the Mongoose API');
});

// Fetch car makes and models
app.get('/get_cars', (req, res) => {
  try {
    // Support either an array or an object containing a cars array
    const cars = Array.isArray(cars_data)
      ? cars_data
      : cars_data.cars;

    if (!Array.isArray(cars)) {
      return res.status(500).json({
        error: 'Invalid car data format'
      });
    }

    res.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({
      error: 'Error fetching cars'
    });
  }
});

// Fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching documents'
    });
  }
});

// Fetch reviews for a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({
      dealership: req.params.id
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching documents'
    });
  }
});

// Fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
  try {
    const documents = await Dealerships.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching dealerships'
    });
  }
});

// Fetch dealerships by state
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const documents = await Dealerships.find({
      state: {
        $regex: `^${req.params.state}$`,
        $options: 'i'
      }
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching dealerships by state'
    });
  }
});

// Fetch a dealership by ID
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const documents = await Dealerships.find({
      id: req.params.id
    });

    res.json(documents);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching dealership details'
    });
  }
});

// Insert a review
app.post(
  '/insert_review',
  express.raw({ type: '*/*' }),
  async (req, res) => {
    try {
      const data = JSON.parse(req.body.toString());

      const documents = await Reviews.find()
        .sort({ id: -1 })
        .limit(1);

      const new_id = documents.length > 0
        ? documents[0].id + 1
        : 1;

      const review = new Reviews({
        id: new_id,
        name: data.name,
        dealership: data.dealership,
        review: data.review,
        purchase: data.purchase,
        purchase_date: data.purchase_date,
        car_make: data.car_make,
        car_model: data.car_model,
        car_year: data.car_year
      });

      const savedReview = await review.save();
      res.json(savedReview);
    } catch (error) {
      console.error('Error inserting review:', error);
      res.status(500).json({
        error: 'Error inserting review'
      });
    }
  }
);

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
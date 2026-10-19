import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Dealers.css';
import '../assets/style.css';
import Header from '../Header/Header';

const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [date, setDate] = useState('');
  const [carmodels, setCarmodels] = useState([]);

  const { id } = useParams();

  const curr_url = window.location.href;
  const root_url = curr_url.substring(
    0,
    curr_url.indexOf('postreview')
  );

  const dealer_url = root_url + `djangoapp/dealer/${id}`;
  const review_url = root_url + 'djangoapp/add_review';
  const carmodels_url = root_url + 'djangoapp/get_cars';

  // Submit the review only when the button is clicked
  const postreview = async () => {
    const firstName = sessionStorage.getItem('firstname');
    const lastName = sessionStorage.getItem('lastname');

    let name = `${firstName || ''} ${lastName || ''}`.trim();

    if (!name) {
      name = sessionStorage.getItem('username') || '';
    }

    if (!model || !review.trim() || !date || !year) {
      alert('All details are mandatory');
      return;
    }

    const selectedCar = carmodels.find(
      (car) => `${car.make} ${car.model}` === model
    );

    if (!selectedCar) {
      alert('Please select a valid car.');
      return;
    }

    const jsoninput = {
      name: name,
      dealership: id,
      review: review,
      purchase: true,
      purchase_date: date,
      car_make: selectedCar.make,
      car_model: selectedCar.model,
      car_year: year,
    };

    try {
      const res = await fetch(review_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsoninput),
      });

      const result = await res.json();

      if (res.ok) {
        alert('Review posted successfully.');
        window.location.href =
          window.location.origin + '/dealer/' + id;
      } else {
        console.error('Review submission failed:', result);
        alert('Unable to post review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Unable to post review. Please try again.');
    }
  };

  // Fetch dealer details
  const get_dealer = async () => {
    try {
      const res = await fetch(dealer_url);

      if (!res.ok) {
        throw new Error(
          `Failed to fetch dealer details: HTTP ${res.status}`
        );
      }

      const retobj = await res.json();

      // The API returns an array of dealers
      if (Array.isArray(retobj) && retobj.length > 0) {
        setDealer(retobj[0]);
      } else {
        console.error('No dealer details found:', retobj);
      }
    } catch (error) {
      console.error('Error fetching dealer:', error);
    }
  };

  // Fetch car makes and models
  const get_cars = async () => {
    try {
      const res = await fetch(carmodels_url);

      if (!res.ok) {
        throw new Error(
          `Failed to fetch cars: HTTP ${res.status}`
        );
      }

      const retobj = await res.json();

      // The API returns an array of car objects directly
      if (Array.isArray(retobj)) {
        const validCars = retobj.filter(
          (car) =>
            car &&
            typeof car.make === 'string' &&
            typeof car.model === 'string'
        );

        setCarmodels(validCars);
      } else {
        console.error('Unexpected cars API response:', retobj);
        setCarmodels([]);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      setCarmodels([]);
    }
  };

  useEffect(() => {
    get_dealer();
    get_cars();
    // Load dealer and car data when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Header />

      <div style={{ margin: '5%' }}>
        <h1 style={{ color: 'darkblue' }}>
          {dealer.full_name || 'Post a Review'}
        </h1>

        <div className="input_field">
          <label htmlFor="review">Review</label>
          <br />
          <textarea
            id="review"
            cols="50"
            rows="7"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </div>

        <div className="input_field">
          <label htmlFor="purchaseDate">Purchase Date</label>
          <input
            id="purchaseDate"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="input_field">
          <label htmlFor="cars">Car Make and Model</label>
          <select
            name="cars"
            id="cars"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="" disabled>
              Choose Car Make and Model
            </option>

            {carmodels.map((carmodel, index) => (
              <option
                key={`${carmodel.make}-${carmodel.model}-${index}`}
                value={`${carmodel.make} ${carmodel.model}`}
              >
                {carmodel.make} {carmodel.model}
              </option>
            ))}
          </select>

          {carmodels.length === 0 && (
            <p>Loading cars or no car data available.</p>
          )}
        </div>

        <div className="input_field">
          <label htmlFor="carYear">Car Year</label>
          <input
            id="carYear"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            max={2026}
            min={1900}
          />
        </div>

        <div>
          <button
            type="button"
            className="postreview"
            onClick={postreview}
          >
            Post Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostReview;
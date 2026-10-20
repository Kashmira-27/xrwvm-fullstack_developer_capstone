import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png";
import neutral_icon from "../assets/neutral.png";
import negative_icon from "../assets/negative.png";
import review_icon from "../assets/reviewbutton.png";
import Header from '../Header/Header';

const Dealer = () => {
  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [unreviewed, setUnreviewed] = useState(false);
  const [error, setError] = useState('');
  const [postReview, setPostReview] = useState(null);

  const { id } = useParams();

  const curr_url = window.location.href;
  const root_url = curr_url.substring(0, curr_url.indexOf("dealer"));

  const dealer_url = root_url + `djangoapp/dealer/${id}`;
  const reviews_url = root_url + `djangoapp/dealer/${id}/reviews`;
  const post_review = root_url + `postreview/${id}`;

  const get_dealer = async () => {
    try {
      const res = await fetch(dealer_url);
      if (!res.ok) throw new Error('Failed to load dealer details');

      const retobj = await res.json();

      // Django returns the dealer data as an array.
      if (Array.isArray(retobj) && retobj.length > 0) {
        setDealer(retobj[0]);
      } else {
        setError('Dealer details not found.');
      }
    } catch (err) {
      console.error('Error loading dealer:', err);
      setError('Unable to load dealer details.');
    }
  };

  const get_reviews = async () => {
    try {
      const res = await fetch(reviews_url);
      if (!res.ok) throw new Error('Failed to load reviews');

      const retobj = await res.json();

      // Django returns reviews as an array.
      const reviewList = Array.isArray(retobj)
        ? retobj
        : Array.isArray(retobj.reviews)
          ? retobj.reviews
          : [];

      setReviews(reviewList);
      setUnreviewed(reviewList.length === 0);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Unable to load reviews.');
    }
  };

  const senti_icon = (sentiment) => {
    if (sentiment === 'positive') return positive_icon;
    if (sentiment === 'negative') return negative_icon;
    return neutral_icon;
  };

  useEffect(() => {
    get_dealer();
    get_reviews();

    if (sessionStorage.getItem('username')) {
      setPostReview(
        <a href={post_review}>
          <img
            src={review_icon}
            style={{ width: '10%', marginLeft: '10px', marginTop: '10px' }}
            alt="Post Review"
          />
        </a>
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div style={{ margin: '20px' }}>
      <Header />

      <div style={{ marginTop: '10px' }}>
        <h1 style={{ color: 'grey' }}>
          {dealer.full_name} {postReview}
        </h1>

        <h4 style={{ color: 'grey' }}>
          {dealer.city && dealer.address
            ? `${dealer.city}, ${dealer.address}, Zip - ${dealer.zip}, ${dealer.state}`
            : ''}
        </h4>
      </div>

      {error && <p>{error}</p>}

      <div className="reviews_panel">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div className="review_panel" key={review._id || index}>
              <img
                src={senti_icon(review.sentiment)}
                className="emotion_icon"
                alt="Sentiment"
              />
              <div className="review">{review.review}</div>
              <div className="reviewer">
                {review.name} {review.car_make} {review.car_model} {review.car_year}
              </div>
            </div>
          ))
        ) : unreviewed ? (
          <div>No reviews yet!</div>
        ) : !error ? (
          <p>Loading Reviews....</p>
        ) : null}
      </div>
    </div>
  );
};

export default Dealer;
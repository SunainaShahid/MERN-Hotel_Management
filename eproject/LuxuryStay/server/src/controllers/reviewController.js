import Review from '../models/Review.js';

// Get all reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a review
export const createReview = async (req, res) => {
  try {
    const { guestName, rating, comment, roomTitle } = req.body;
    const newReview = await Review.create({ guestName, rating, comment, roomTitle });
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
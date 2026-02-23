import express from 'express';
import Review from '../models/Review.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Get reviews for a specific item (movie/book)
router.get('/item/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const { type } = req.query; // 'movie' or 'book'

        const query = { itemId };
        if (type) query.itemType = type;

        const reviews = await Review.find(query)
            .populate('user', 'username')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
});

// Get user's own reviews
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user.userId })
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user reviews' });
    }
});

// Create a new review
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { itemId, itemType, rating, text } = req.body;

        const existingReview = await Review.findOne({
            user: req.user.userId,
            itemId
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this item' });
        }

        const review = new Review({
            user: req.user.userId,
            itemId,
            itemType,
            rating,
            text
        });

        await review.save();

        // Return populated review
        const populatedReview = await Review.findById(review._id).populate('user', 'username');
        res.status(201).json(populatedReview);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create review' });
    }
});

// Update a review
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { rating, text } = req.body;

        const review = await Review.findOne({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!review) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }

        if (rating) review.rating = rating;
        if (text !== undefined) review.text = text;

        await review.save();

        const updatedReview = await Review.findById(review._id).populate('user', 'username');
        res.json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update review' });
    }
});

// Delete a review
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const review = await Review.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!review) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete review' });
    }
});

export default router;

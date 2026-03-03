import express from 'express';
import axios from 'axios';

const router = express.Router();

const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

// Helper function for API requests
const fetchFromGoogleBooks = async (endpoint = '', queryParams = {}) => {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    // We don't strictly *need* an API key for public data, but it increases the quota.
    const params = { ...queryParams };
    if (apiKey && apiKey !== 'your_google_books_api_key_here') {
        params.key = apiKey;
    }

    try {
        const response = await axios.get(`${GOOGLE_BOOKS_BASE_URL}${endpoint}`, { params });
        return response.data;
    } catch (error) {
        console.error(`Google Books API Error (${endpoint}):`, error.message);
        throw error;
    }
};

// Get trending books (We'll search for popular recent books)
router.get('/trending', async (req, res) => {
    try {
        // "subject:fiction" ordered by relevance/newest is a good proxy for trending
        const data = await fetchFromGoogleBooks('', {
            q: 'subject:fiction',
            orderBy: 'newest',
            maxResults: 15
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch trending books', error: error.message });
    }
});

// Search books
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const data = await fetchFromGoogleBooks('', { q: query, maxResults: 20 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to search books', error: error.message });
    }
});

// Get book details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await fetchFromGoogleBooks(`/${id}`);
        res.json(data);
    } catch (error) {
        console.error(`Error fetching details for book ${req.params.id}:`, error.message);
        res.status(500).json({ message: 'Failed to fetch book details', error: error.message });
    }
});

export default router;

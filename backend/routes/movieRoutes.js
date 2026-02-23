import express from 'express';
import axios from 'axios';

const router = express.Router();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Create Axios instance with IPv4 and Keep-Alive to fix ECONNRESET
import https from 'https';
const tmdbClient = axios.create({
    baseURL: TMDB_BASE_URL,
    timeout: 10000,
    headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip,deflate,compress'
    },
    // Force IPv4 to prevent Node.js 18+ ECONNRESET issues
    httpsAgent: new https.Agent({ family: 4, keepAlive: true })
});

// Helper function for API requests
const fetchFromTMDB = async (endpoint, queryParams = {}) => {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey || apiKey === 'your_tmdb_api_key_here') {
        throw new Error('TMDB API Key is missing in environment variables');
    }

    try {
        const response = await tmdbClient.get(endpoint, {
            params: {
                api_key: apiKey,
                ...queryParams
            }
        });
        return response.data;
    } catch (error) {
        console.error(`TMDB API Error (${endpoint}):`, error.message);
        throw error;
    }
};

// Get trending movies
router.get('/trending', async (req, res) => {
    try {
        const data = await fetchFromTMDB('/trending/movie/week');
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch trending movies', error: error.message });
    }
});

// Search movies
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const data = await fetchFromTMDB('/search/movie', { query });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to search movies', error: error.message });
    }
});

// Get movie details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await fetchFromTMDB(`/movie/${id}`, {
            append_to_response: 'credits,videos'
        });
        res.json(data);
    } catch (error) {
        console.error(`Error fetching details for movie ${req.params.id}:`, error.message);
        if (error.response) {
            console.error('TMDB Response:', error.response.data);
        }
        res.status(500).json({ message: 'Failed to fetch movie details', error: error.message });
    }
});

export default router;

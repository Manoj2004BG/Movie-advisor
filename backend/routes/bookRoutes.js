import express from 'express';
import axios from 'axios';

const router = express.Router();

// Helper to map Open Library document format to our expected Google Books-like structure
// This ensures we do not have to rewrite any frontend code!
const mapOpenLibraryToStandard = (docs) => {
    return docs.map(doc => {
        // Trending returns 'key' as '/works/OL...', Search returns 'key' as 'OL...' or '/works/OL...'
        const id = (doc.key || '').replace('/works/', '');
        const coverImage = doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
            : null;

        return {
            id: id,
            volumeInfo: {
                title: doc.title || 'Unknown Title',
                authors: doc.author_name ? doc.author_name : ['Unknown Author'],
                publishedDate: doc.first_publish_year ? doc.first_publish_year.toString() : '',
                imageLinks: coverImage ? { thumbnail: coverImage } : null,
                // OMDB trending/search often doesn't give a description immediately
                description: 'Click to view full description.',
            }
        };
    });
};

// Get trending books 
router.get('/trending', async (req, res) => {
    try {
        const response = await axios.get('https://openlibrary.org/trending/daily.json?limit=15');
        const works = response.data.works || [];
        // Map works array and wrap it in { items: [...] } like Google Books did
        res.json({ items: mapOpenLibraryToStandard(works) });
    } catch (error) {
        console.error('Open Library Trending Error:', error.message);
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

        const response = await axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`);
        const docs = response.data.docs || [];
        res.json({ items: mapOpenLibraryToStandard(docs) });
    } catch (error) {
        console.error('Open Library Search Error:', error.message);
        res.status(500).json({ message: 'Failed to search books', error: error.message });
    }
});

// Get book details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Fetch raw details from Open Library works endpoint
        const response = await axios.get(`https://openlibrary.org/works/${id}.json`);
        const data = response.data;

        // Open Library descriptions can be raw strings OR objects like { type: 'text', value: '...' }
        const description = typeof data.description === 'string'
            ? data.description
            : (data.description?.value || 'No detailed description available.');

        // Build a simulated Google item structure
        const item = {
            id: id,
            volumeInfo: {
                title: data.title || 'Unknown Title',
                description: description,
                // Authors in detailed 'works' view usually require an extra API call. For speed, we fake it or omit it.
                authors: ['Open Library Author'],
                averageRating: null,
                imageLinks: data.covers?.[0]
                    ? { thumbnail: `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg` }
                    : null
            }
        };

        res.json(item);
    } catch (error) {
        console.error(`Error fetching details for book ${req.params.id}:`, error.message);
        res.status(500).json({ message: 'Failed to fetch book details', error: error.message });
    }
});

export default router;

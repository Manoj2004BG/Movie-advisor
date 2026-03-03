import axios from 'axios';

// Define the base URL dynamically based on environment
const API_URL = import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : (import.meta.env.VITE_API_URL || 'https://movie-advisor.onrender.com/api');

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the JWT token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth endpoints
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);

// Movies endpoints
export const getTrendingMovies = () => api.get('/movies/trending');
export const searchMovies = (query) => api.get(`/movies/search?query=${query}`);
export const getMovieDetails = (id) => api.get(`/movies/${id}`);

// Books endpoints
export const getTrendingBooks = () => api.get('/books/trending');
export const searchBooks = (query) => api.get(`/books/search?query=${query}`);
export const getBookDetails = (id) => api.get(`/books/${id}`);

// Reviews endpoints
export const getReviewsForItem = (itemId, type = 'movie') => api.get(`/reviews/item/${itemId}?type=${type}`);
export const getUserReviews = () => api.get('/reviews/user');
export const createReview = (reviewData) => api.post('/reviews', reviewData);
export const updateReview = (id, reviewData) => api.put(`/reviews/${id}`, reviewData);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

export default api;

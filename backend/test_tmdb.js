import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const testTMDB = async () => {
    const apiKey = process.env.TMDB_API_KEY;
    console.log('Testing with API Key length:', apiKey?.length);

    try {
        console.log('Fetching trending...');
        const res1 = await axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`);
        console.log('Trending successful! status:', res1.status, 'results:', res1.data.results.length);
    } catch (err) {
        console.error('Trending failed:', err.message);
    }

    try {
        console.log('Fetching details for 823464...');
        const res2 = await axios.get(`https://api.themoviedb.org/3/movie/823464?api_key=${apiKey}&append_to_response=credits,videos`);
        console.log('Details successful! status:', res2.status, 'title:', res2.data.title);
    } catch (err) {
        console.error('Details failed:', err.message);
    }
};

testTMDB();

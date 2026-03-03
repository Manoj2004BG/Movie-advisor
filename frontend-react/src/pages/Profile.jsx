import React, { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Star, FileText, Film, BookOpen, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getUserReviews, getMovieDetails, getBookDetails } from '../utils/api';

export default function Profile() {
    const { user } = useContext(AuthContext);

    const [reviews, setReviews] = useState([]);
    const [enrichedReviews, setEnrichedReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    useEffect(() => {
        const fetchUserHistory = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch the raw review data
                const { data: rawReviews } = await getUserReviews();
                setReviews(rawReviews);

                // 2. Fetch the metadata (Title & Image) for each review
                const enrichmentPromises = rawReviews.map(async (review) => {
                    try {
                        let itemDetails = null;
                        if (review.itemType === 'movie') {
                            const res = await getMovieDetails(review.itemId);
                            itemDetails = res.data;

                            return {
                                ...review,
                                title: itemDetails.title || itemDetails.name,
                                image: itemDetails.poster_path
                                    ? `https://image.tmdb.org/t/p/w500${itemDetails.poster_path}`
                                    : 'https://via.placeholder.com/500x750?text=No+Poster'
                            };
                        } else if (review.itemType === 'book') {
                            const res = await getBookDetails(review.itemId);
                            itemDetails = res.data.volumeInfo;

                            return {
                                ...review,
                                title: itemDetails.title,
                                image: itemDetails.imageLinks?.thumbnail?.replace('http:', 'https:')
                                    || 'https://via.placeholder.com/500x750?text=No+Cover'
                            };
                        }
                    } catch (err) {
                        console.error(`Failed to fetch details for ${review.itemId}`, err);
                        return {
                            ...review,
                            title: 'Unknown Item (Data Unavailable)',
                            image: 'https://via.placeholder.com/500x750?text=Unavailable'
                        };
                    }
                });

                const enriched = await Promise.all(enrichmentPromises);
                setEnrichedReviews(enriched);

            } catch (err) {
                console.error('Failed to load user reviews', err);
                setError('Failed to load your review history.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserHistory();
    }, []);

    if (isLoading) {
        return (
            <div className="flex-1 flex justify-center items-center py-24">
                <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="pb-12 max-w-5xl mx-auto w-full">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8 mt-4 backdrop-blur-sm">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-tr from-rose-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-rose-500/20 border-4 border-zinc-950">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white">{user.username}'s Profile</h1>
                        <p className="text-zinc-400 mt-1 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {reviews.length} Total Reviews
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-800 pb-4">
                    Your Review History
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl">
                        {error}
                    </div>
                )}

                {!isLoading && enrichedReviews.length === 0 && !error && (
                    <div className="text-center py-12 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl">
                        <Star className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-zinc-400">No Reviews Yet</h3>
                        <p className="text-zinc-600 mt-2">You haven't reviewed any books or movies yet.</p>
                        <Link to="/" className="inline-block mt-6 bg-rose-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-rose-600 transition-colors">
                            Start Exploring
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enrichedReviews.map((review) => (
                        <div key={review._id} className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl overflow-hidden flex flex-col sm:flex-row hover:border-zinc-700 transition-colors group">
                            <Link
                                to={review.itemType === 'movie' ? `/movie/${review.itemId}` : `/book/${review.itemId}`}
                                className="sm:w-32 aspect-[2/3] sm:aspect-auto sm:h-auto overflow-hidden bg-zinc-950 relative"
                            >
                                <img
                                    src={review.image}
                                    alt={review.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-2 left-2 bg-zinc-950/80 backdrop-blur p-1.5 rounded-md border border-white/10">
                                    {review.itemType === 'movie' ? <Film className="w-4 h-4 text-rose-400" /> : <BookOpen className="w-4 h-4 text-indigo-400" />}
                                </div>
                            </Link>

                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <Link to={review.itemType === 'movie' ? `/movie/${review.itemId}` : `/book/${review.itemId}`}>
                                        <h3 className="text-xl font-bold text-white hover:text-rose-400 transition-colors line-clamp-1 mb-2">
                                            {review.title}
                                        </h3>
                                    </Link>

                                    <div className="flex items-center gap-1 mb-3 bg-amber-400/10 w-fit px-2 py-1 rounded text-amber-400 border border-amber-400/20">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400' : 'text-zinc-600'}`} />
                                        ))}
                                    </div>

                                    {review.text && (
                                        <p className="text-zinc-400 text-sm italic line-clamp-3 mb-4">
                                            "{review.text}"
                                        </p>
                                    )}
                                </div>

                                <div className="text-xs text-zinc-500 font-medium">
                                    Reviewed on {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Heart, Share2, Clock, Calendar, Loader2 } from 'lucide-react';
import { getMovieDetails, getReviewsForItem, createReview } from '../utils/api';
import { AuthContext } from '../context/AuthContext';

export default function Details() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [userRating, setUserRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                const [movieRes, reviewsRes] = await Promise.all([
                    getMovieDetails(id),
                    getReviewsForItem(id, 'movie')
                ]);

                setMovie(movieRes.data);
                setReviews(reviewsRes.data);
            } catch (err) {
                setError('Failed to load movie details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const handleSubmitReview = async () => {
        if (!user) {
            setReviewError('You must be logged in to leave a review.');
            return;
        }
        if (userRating === 0) {
            setReviewError('Please select a rating.');
            return;
        }

        setIsSubmitting(true);
        setReviewError('');

        try {
            const { data } = await createReview({
                itemId: id,
                itemType: 'movie',
                rating: userRating,
                text: reviewText
            });

            // Add new review to the top of the list
            setReviews([data, ...reviews]);
            setUserRating(0);
            setReviewText('');
        } catch (err) {
            setReviewError(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex justify-center items-center py-24">
                <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-xl mt-8">
                <h3 className="font-bold">Error</h3>
                <p>{error || 'Movie not found'}</p>
            </div>
        );
    }

    const backdropUrl = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : null;

    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster';

    const releaseYear = (movie.release_date || '').substring(0, 4);

    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
        : null;

    return (
        <div className="pb-12">
            {/* Backdrop Section */}
            <div className="relative h-[40vh] md:h-[60vh] -mx-4 -mt-8 mb-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent z-10" />
                {backdropUrl && (
                    <img
                        src={backdropUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover opacity-50"
                    />
                )}
                <div className="absolute top-4 left-4 z-50">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-300 hover:text-white bg-zinc-900/50 px-4 py-2 rounded-full backdrop-blur transition-all border border-white/5">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 w-full z-20 p-4 md:p-12 pb-8 flex items-end gap-8 max-w-7xl mx-auto">
                    <img
                        src={posterUrl}
                        alt={movie.title}
                        className="w-32 md:w-56 rounded-xl shadow-2xl shadow-black border border-zinc-800 hidden sm:block bg-zinc-900"
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                            {movie.genres?.slice(0, 3).map(g => (
                                <span key={g.id} className="bg-rose-500/10 text-rose-500 text-sm font-semibold px-3 py-1 rounded-full border border-rose-500/20">
                                    {g.name}
                                </span>
                            ))}
                            <div className="flex items-center gap-1 text-amber-400 font-bold bg-zinc-900/50 px-3 py-1 rounded-full backdrop-blur border border-amber-400/20">
                                <Star className="w-4 h-4 fill-amber-400" />
                                <span>{movie.vote_average?.toFixed(1)}</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
                            {movie.title}
                        </h1>
                        <div className="flex items-center gap-6 text-zinc-300 text-sm font-medium">
                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-zinc-400" /> {releaseYear}</span>
                            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-zinc-400" /> {movie.runtime} min</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
                        <p className="text-lg text-zinc-300 leading-relaxed">
                            {movie.overview}
                        </p>
                    </section>

                    <section className="border-t border-zinc-800 pt-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-white">Reviews ({reviews.length})</h2>
                                {avgRating && (
                                    <span className="flex items-center gap-1 text-sm font-medium bg-amber-400/10 text-amber-400 px-3 py-1.5 rounded-full border border-amber-400/20 shadow-lg">
                                        <Star className="w-4 h-4 fill-amber-400" />
                                        User Avg: {avgRating}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Write Review Component */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8 backdrop-blur">
                            <h3 className="font-semibold text-white mb-4">Rate this Movie</h3>

                            {reviewError && (
                                <div className="text-red-400 text-sm mb-4">{reviewError}</div>
                            )}

                            <div className="flex items-center gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setUserRating(star)}
                                        className={`transition-all hover:scale-110 ${star <= userRating ? 'text-amber-400' : 'text-zinc-700 hover:text-amber-400/50'}`}
                                    >
                                        <Star className={`w-8 h-8 ${star <= userRating ? 'fill-amber-400' : ''}`} />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Share your thoughts..."
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none h-24 mb-4"
                            ></textarea>
                            <button
                                onClick={handleSubmitReview}
                                disabled={isSubmitting}
                                className="bg-rose-500 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-rose-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto shadow-lg shadow-rose-500/20"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>

                        {/* Review List */}
                        <div className="space-y-4">
                            {reviews.length === 0 ? (
                                <p className="text-zinc-500 text-center py-8">No reviews yet. Be the first to review!</p>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review._id} className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-tr from-rose-500/80 to-amber-500/80 rounded-full flex items-center justify-center text-white font-bold border border-white/10">
                                                    {review.user?.username?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-zinc-200">{review.user?.username || 'Unknown User'}</h4>
                                                    <span className="text-xs text-zinc-500">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                <span className="font-bold text-sm">{review.rating}</span>
                                            </div>
                                        </div>
                                        {review.text && <p className="text-zinc-400 leading-relaxed">{review.text}</p>}
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Movie Info Box */}
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl mt-6">
                        <h3 className="font-bold text-white mb-4">Movie Info</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                                <span className="text-zinc-500">Status</span>
                                <span className="text-zinc-300">{movie.status}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                                <span className="text-zinc-500">Language</span>
                                <span className="text-zinc-300 uppercase">{movie.original_language}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Budget</span>
                                <span className="text-zinc-300">
                                    {movie.budget ? `$${(movie.budget / 1000000).toFixed(1)}M` : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

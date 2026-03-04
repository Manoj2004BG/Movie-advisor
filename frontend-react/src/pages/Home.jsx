import React, { useState, useEffect } from 'react';
import { Star, Heart, Loader2, BookOpen, Film } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { getTrendingMovies, searchMovies, getTrendingBooks, searchBooks } from '../utils/api';

export default function Home() {
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search');

    // Default to Movies, but sync tightly with the ?type URL parameter from the header
    const typeParam = searchParams.get('type');
    const activeTab = typeParam === 'books' ? 'Books' : 'Movies';

    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchItems = async () => {
            setIsLoading(true);
            try {
                let response;
                if (activeTab === 'Movies') {
                    if (searchQuery) {
                        response = await searchMovies(searchQuery);
                    } else {
                        response = await getTrendingMovies();
                    }
                    setItems(response.data.results.slice(0, 15));
                } else {
                    if (searchQuery) {
                        response = await searchBooks(searchQuery);
                    } else {
                        response = await getTrendingBooks();
                    }
                    // Google Books returns an array of items
                    setItems(response.data.items ? response.data.items.slice(0, 15) : []);
                }
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || `Failed to fetch ${activeTab.toLowerCase()}. Please try again later.`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();
    }, [searchQuery, activeTab]);

    const getMovieUrl = (path) => path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://via.placeholder.com/500x750?text=No+Poster';

    // Google API returns robust objects. We map them to common interface where possible for the view
    const normalizeItem = (item) => {
        if (activeTab === 'Movies') {
            return {
                id: item.id,
                title: item.title || item.name,
                image: getMovieUrl(item.poster_path),
                backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
                date: (item.release_date || item.first_air_date || '').substring(0, 4),
                rating: item.vote_average?.toFixed(1) || 'NR',
                overview: item.overview,
                link: `/movie/${item.id}`
            };
        } else {
            const info = item.volumeInfo || {};
            const image = info.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://via.placeholder.com/500x750?text=No+Cover';
            return {
                id: item.id,
                title: info.title,
                image: image,
                backdrop: image, // Books don't typically have backdrops, fallback to cover
                date: (info.publishedDate || '').substring(0, 4),
                rating: info.averageRating ? info.averageRating.toFixed(1) : 'NR',
                overview: info.description || 'No description available.',
                author: info.authors ? info.authors[0] : 'Unknown Author',
                link: `/book/${item.id}`
            };
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex justify-center items-center py-24">
                <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-xl mt-8">
                <h3 className="font-bold">Error</h3>
                <p>{error}</p>
            </div>
        );
    }

    const featuredItem = items.length > 0 ? normalizeItem(items[0]) : null;

    return (
        <div className="space-y-12">
            {!searchQuery && featuredItem && (
                <section className="relative rounded-2xl overflow-hidden min-h-[400px] flex items-end">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent z-10" />
                    {featuredItem.backdrop && (
                        <img
                            src={featuredItem.backdrop}
                            alt="Featured Backdrop"
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />
                    )}
                    <div className="relative z-20 p-8 md:p-12 w-full md:w-2/3">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-rose-500/20 text-rose-500 text-xs font-semibold px-2 py-1 rounded border border-rose-500/30">
                                Trending No. 1 {activeTab === 'Movies' ? 'Movie' : 'Book'}
                            </span>
                            <span className="text-zinc-300 text-sm flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {featuredItem.rating}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
                            {featuredItem.title}
                        </h1>
                        <p className="text-zinc-300 text-lg mb-6 line-clamp-2 max-w-2xl">
                            {featuredItem.overview}
                        </p>
                        <div className="flex items-center gap-4">
                            <Link to={featuredItem.link} className="bg-white text-zinc-950 font-bold px-6 py-3 rounded-full hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10">
                                View Details
                            </Link>
                            <button className="bg-zinc-800/80 backdrop-blur text-white p-3 rounded-full hover:bg-zinc-700 transition-colors border border-zinc-700">
                                <Heart className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </section>
            )}

            <section>
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        {searchQuery ? `Search Results for "${searchQuery}" in ${activeTab}` : `Trending ${activeTab}`}
                    </h2>
                </div>

                {items.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500">
                        <p className="text-xl font-semibold mb-2">No results found</p>
                        <p>Try adjusting your search query or switching tabs.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                        {items.map((rawItem) => {
                            const item = normalizeItem(rawItem);
                            return (
                                <Link key={item.id} to={item.link} className="group relative">
                                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 mb-3 relative shadow-lg group-hover:shadow-rose-500/10 transition-all group-hover:-translate-y-1">
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                            <div className="flex items-center justify-between">
                                                <span className={`${activeTab === 'Movies' ? 'bg-rose-500' : 'bg-indigo-500'} text-white text-xs font-bold px-2 py-1 rounded`}>View</span>
                                                <button className="text-white hover:text-rose-500"><Heart className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-zinc-100 truncate group-hover:text-rose-400 transition-colors">
                                        {item.title}
                                    </h3>
                                    <div className="flex flex-col mt-1 text-sm text-zinc-500">
                                        {item.author && <span className="truncate text-zinc-400 text-xs">{item.author}</span>}
                                        <div className="flex items-center justify-between mt-1 text-sm text-zinc-500">
                                            <span>{item.date}</span>
                                            <span className="flex items-center gap-1 text-amber-400 font-medium bg-zinc-900/50 px-1.5 rounded">
                                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                {item.rating}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

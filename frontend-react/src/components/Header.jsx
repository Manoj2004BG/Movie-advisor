import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Film, User, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Header() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.key === 'Enter' && e.target.value) {
            navigate(`/?search=${e.target.value}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-rose-500 hover:text-rose-400 transition-colors">
                    <Film className="w-6 h-6" />
                    <span className="text-xl font-bold tracking-tight text-white">Movie Advisor</span>
                </Link>
                <div className="flex-1 max-w-md mx-4 hidden md:flex items-center relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-zinc-400 group-focus-within:text-rose-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search movies or books (Press Enter)..."
                        onKeyDown={handleSearch}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all placeholder:text-zinc-500"
                    />
                </div>
                <nav className="flex items-center gap-6">
                    <Link to="/" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Explore</Link>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-zinc-400 flex items-center gap-2">
                                <User className="w-4 h-4" /> {user.username}
                            </span>
                            <button
                                onClick={logout}
                                className="text-sm font-medium bg-zinc-800 text-white px-3 py-2 rounded-full hover:bg-zinc-700 transition-colors flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="text-sm font-medium bg-rose-500 text-white px-4 py-2 rounded-full hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20">
                            Sign In
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

import React, { useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Sparkles, User, LogOut, Clapperboard, Library } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Header() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const activeTab = searchParams.get('type') === 'books' ? 'books' : 'movies';

    const handleSearch = (e) => {
        if (e.key === 'Enter' && e.target.value) {
            navigate(`/?search=${e.target.value}&type=${activeTab}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group transition-all">
                    <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-indigo-600 shadow-xl shadow-rose-500/20 group-hover:shadow-rose-500/40 transition-all group-hover:scale-105 group-hover:rotate-3 border border-white/10">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 group-hover:to-zinc-300 transition-colors">
                        MovieAdvisor
                    </span>
                </Link>
                <div className="flex-1 max-w-md mx-4 hidden md:flex items-center relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-zinc-400 group-focus-within:text-rose-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder={`Search ${activeTab} (Press Enter)...`}
                        onKeyDown={handleSearch}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all placeholder:text-zinc-500"
                    />
                </div>
                <nav className="flex items-center gap-4">
                    <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-full border border-zinc-800 mr-2">
                        <Link
                            to="/?type=movies"
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'movies' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                        >
                            <Clapperboard className="w-3.5 h-3.5" /> Movies
                        </Link>
                        <Link
                            to="/?type=books"
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === 'books' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
                        >
                            <Library className="w-3.5 h-3.5" /> Books
                        </Link>
                    </div>

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

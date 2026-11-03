import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ClientCard from '../components/ClientCard';
import { DashboardSkeleton } from '../components/Loading';
import { useClients } from '../hooks/useClients';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  Flame,
  ArrowUpDown,
  Sparkles,
  RefreshCw,
  FolderLock
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { clients, loading, refreshClients, totalCount } = useClients();
  const { isFirebaseConfigured } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent | alpha | highest | lowest

  // Filter & sort clients
  const processedClients = useMemo(() => {
    let result = [...clients];

    // Filter by name
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(c =>
        c.name.toLowerCase().includes(term) ||
        (c.place && c.place.toLowerCase().includes(term))
      );
    }

    // Sort
    switch (sortBy) {
      case 'alpha':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'highest':
        result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'lowest':
        result.sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0));
        break;
      case 'recent':
      default:
        result.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        break;
    }

    return result;
  }, [clients, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-[#0B0B0F] pb-24 text-white">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Environment Alert Banner if in preview mode */}
        {!isFirebaseConfigured && (
          <div className="bg-purple-950/30 border border-purple-500/20 rounded-2xl p-3 flex items-center justify-between text-xs text-purple-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
              <span>
                Running in <strong>Local Preview Mode</strong> with sample data.
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-pink-400 px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 shrink-0">
              Sandbox
            </span>
          </div>
        )}

        {/* BODY COUNT HERO STATISTIC */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#17171F] to-[#121218] border border-[#2A2A35] p-6 text-center shadow-2xl">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-28 h-28 bg-pink-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#20202A] border border-[#2A2A35] text-[11px] font-extrabold uppercase tracking-widest text-[#92929E] mb-2">
            <Flame className="w-3.5 h-3.5 text-pink-500 fill-current" />
            <span>Body Count</span>
          </div>

          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-6xl font-black tracking-tight bg-gradient-to-r from-white via-purple-100 to-pink-200 bg-clip-text text-transparent filter drop-shadow-[0_0_25px_rgba(168,85,247,0.3)]">
              {totalCount}
            </span>
          </div>

          <p className="text-xs text-[#92929E] font-medium mt-1">
            Dihs conqured
          </p>
        </section>

        {/* SEARCH & FILTER CONTROLS */}
        <section className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#92929E]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients by name or location..."
              className="w-full bg-[#17171F] border border-[#2A2A35] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-[#92929E] hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <div className="flex items-center gap-1 text-[#92929E] pl-1 pr-2 shrink-0 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
              <span>Sort:</span>
            </div>

            <button
              onClick={() => setSortBy('recent')}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                sortBy === 'recent'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                  : 'bg-[#17171F] text-[#92929E] hover:text-white border border-[#2A2A35]'
              }`}
            >
              Recently Added
            </button>

            <button
              onClick={() => setSortBy('alpha')}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                sortBy === 'alpha'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                  : 'bg-[#17171F] text-[#92929E] hover:text-white border border-[#2A2A35]'
              }`}
            >
              Alphabetical (A-Z)
            </button>

            <button
              onClick={() => setSortBy('highest')}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                sortBy === 'highest'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                  : 'bg-[#17171F] text-[#92929E] hover:text-white border border-[#2A2A35]'
              }`}
            >
              Highest Rated ⭐
            </button>

            <button
              onClick={() => setSortBy('lowest')}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                sortBy === 'lowest'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                  : 'bg-[#17171F] text-[#92929E] hover:text-white border border-[#2A2A35]'
              }`}
            >
              Lowest Rated
            </button>
          </div>
        </section>

        {/* DIRECTORY SECTION */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#92929E] flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span> THE LIST ({processedClients.length})</span>
            </h2>

            <button
              onClick={() => refreshClients()}
              title="Refresh list"
              className="text-[#92929E] hover:text-white p-1 rounded-lg hover:bg-[#17171F] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <DashboardSkeleton />
          ) : processedClients.length > 0 ? (
            <div className="space-y-3">
              {processedClients.map((client) => (
                <ClientCard key={client.clientId || client.id} client={client} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-[#17171F] border border-dashed border-[#2A2A35] rounded-3xl p-8 text-center space-y-3 mt-4">
              <div className="w-16 h-16 rounded-full bg-[#20202A] flex items-center justify-center mx-auto text-3xl">
                🍆
              </div>
              <h3 className="text-base font-bold text-white">
                {searchTerm ? 'No clients match your search' : 'No Clients In Your Directory'}
              </h3>
              <p className="text-xs text-[#92929E] max-w-xs mx-auto">
                {searchTerm
                  ? `No profiles found matching "${searchTerm}". Try a different keyword.`
                  : 'Start tracking your private client profiles and recording interactions.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate('/add-client')}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 hover:shadow-pink-600/40 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Dih</span>
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* FLOATING ACTION BUTTON (+) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => navigate('/add-client')}
          aria-label="Add New Client"
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-purple-500 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-2xl shadow-purple-600/50 border border-white/20 transition-all duration-200 group"
        >
          <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}


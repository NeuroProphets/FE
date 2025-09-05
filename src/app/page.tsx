"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Film, Star, Clock, Calendar, User } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  genre: string;
  year: number;
  rating: number;
  description: string;
  director: string;
  cast: string[];
  duration: number;
  poster_emoji: string;
  tags: string[];
}

interface RecommendationItem {
  title: string;
  genre: string;
  rating: number;
  reason: string;
  similarity_score: number;
}

interface RecommendationResponse {
  recommendations: RecommendationItem[];
  timestamp: string;
  based_on: string;
  total_found: number;
}

interface ApiResponse {
  movies: Movie[];
  total: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://74.225.249.37:8000";

export default function MovieRecommender() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<string>('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingMovies, setFetchingMovies] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch movies from backend on mount
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setFetchingMovies(true);
        const response = await fetch(`${API_BASE}/movies`);
        if (!response.ok) throw new Error('Failed to fetch movies');
        
        const data: ApiResponse = await response.json();
        setMovies(data.movies || []);
      } catch (err) {
        setError('Failed to load movies. Please check if the backend is running.');
        console.error('Error fetching movies:', err);
      } finally {
        setFetchingMovies(false);
      }
    };

    fetchMovies();
  }, []);

  // Handle movie selection
  const handleMovieSelection = useCallback((movieId: string) => {
    setSelectedMovieId(movieId);
    const movie = movies.find(m => m.id === parseInt(movieId));
    setSelectedMovie(movie || null);
    setRecommendations([]);
    setError(null);
  }, [movies]);

  // Get recommendations
  const getRecommendations = async () => {
    if (!selectedMovieId) {
      setError('Please select a movie first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/recommend/${selectedMovieId}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');

      const data: RecommendationResponse = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format duration to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (fetchingMovies) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Film className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="text-lg">Loading movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            🎬 Movie AI
          </h1>
          <p className="text-xl text-gray-300">Discover your next favorite movie with AI-powered recommendations</p>
        </div>

        {/* Movie Selection */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <label htmlFor="movie-select" className="block text-lg font-semibold text-white mb-4">
              Select a Movie You Enjoyed:
            </label>
            
            <div className="relative mb-6">
              <select
                id="movie-select"
                value={selectedMovieId}
                onChange={(e) => handleMovieSelection(e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-all duration-200 hover:bg-white/20"
              >
                <option value="" className="bg-gray-800 text-white">Choose a movie...</option>
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id} className="bg-gray-800 text-white">
                    {movie.poster_emoji} {movie.title} ({movie.year}) - {movie.genre}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Selected Movie Details */}
            {selectedMovie && (
              <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{selectedMovie.poster_emoji}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{selectedMovie.title}</h3>
                    <p className="text-gray-300 mb-3">{selectedMovie.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center text-gray-300">
                        <Star className="w-4 h-4 mr-1 text-yellow-400" />
                        {selectedMovie.rating}/10
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Calendar className="w-4 h-4 mr-1 text-blue-400" />
                        {selectedMovie.year}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Clock className="w-4 h-4 mr-1 text-green-400" />
                        {formatDuration(selectedMovie.duration)}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <User className="w-4 h-4 mr-1 text-purple-400" />
                        {selectedMovie.director}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                          {selectedMovie.genre}
                        </span>
                        {selectedMovie.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={getRecommendations}
              disabled={!selectedMovieId || loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Finding Recommendations...
                </div>
              ) : (
                'Get Recommendations 🚀'
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                🎯 Recommended Movies for You
              </h2>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-white text-lg">{rec.title}</h3>
                      <div className="flex items-center bg-yellow-500/20 rounded-full px-2 py-1">
                        <Star className="w-3 h-3 text-yellow-400 mr-1" />
                        <span className="text-yellow-300 text-sm">{rec.rating}</span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 bg-blue-600/30 text-blue-300 text-xs rounded-full">
                        {rec.genre}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3">{rec.reason}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        Match: {Math.round(rec.similarity_score * 100)}%
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mx-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                          style={{width: `${rec.similarity_score * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedMovie && (
                <p className="text-center text-gray-400 text-sm mt-6">
                  Based on your selection: <span className="text-white font-semibold">{selectedMovie.title}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-400">
            Powered by CinemaAI • {movies.length} movies in database
          </p>
        </div>
      </div>
    </div>
  );
}
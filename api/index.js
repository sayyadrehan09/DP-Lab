// Vercel Serverless Function for CinePattern / TiMN OTT & Movie Recommendation System
// Implements all 8 Gang of Four (GoF) design pattern API endpoints for Vercel deployment.

const url = require('url');

// Supabase Cloud Configuration
const SUPABASE_URL = "https://mhxkftnldxziqhydyfbf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oeGtmdG5sZHh6aXFoeWR5ZmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MjM5NDIsImV4cCI6MjEwNzE5OTk0Mn0.3PSHd6qK3WuhN69gXZhcC_yTmHwmFf5sEwyVTdMe714";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oeGtmdG5sZHh6aXFoeWR5ZmJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTYyMzk0MiwiZXhwIjoyMTA3MTk5OTQyfQ.Ip5R7TTG_JgRQ32dtxwK0JnQvFUcaqrlvYVH9THynhc";
const SUPABASE_BUCKET = "invoices";

// Initial In-Memory Seed Data (used as baseline or fallback)
const INITIAL_MOVIES = [
  { id: 1, title: "The Shawshank Redemption", genre: "Drama", language: "English", rating: 9.3, year: 1994, platform: "Netflix" },
  { id: 2, title: "The Godfather", genre: "Drama", language: "English", rating: 9.2, year: 1972, platform: "Prime Video" },
  { id: 3, title: "The Dark Knight", genre: "Action", language: "English", rating: 9.1, year: 2008, platform: "Netflix" },
  { id: 4, title: "The Lord of the Rings", genre: "Action", language: "English", rating: 9.0, year: 2003, platform: "Prime Video" },
  { id: 5, title: "Inception", genre: "Sci-Fi", language: "English", rating: 9.0, year: 2010, platform: "Netflix" },
  { id: 6, title: "Interstellar", genre: "Sci-Fi", language: "English", rating: 9.0, year: 2014, platform: "Prime Video" },
  { id: 7, title: "Avengers: Endgame", genre: "Action", language: "English", rating: 8.4, year: 2019, platform: "Disney+" },
  { id: 8, title: "Dangal", genre: "Drama", language: "Hindi", rating: 8.3, year: 2016, platform: "Netflix" },
  { id: 9, title: "3 Idiots", genre: "Comedy", language: "Hindi", rating: 8.4, year: 2009, platform: "Prime Video" },
  { id: 10, title: "KGF", genre: "Action", language: "Hindi", rating: 8.2, year: 2018, platform: "Prime Video" },
  { id: 11, title: "Drishyam", genre: "Thriller", language: "Hindi", rating: 8.2, year: 2015, platform: "Netflix" },
  { id: 12, title: "The Martian", genre: "Sci-Fi", language: "English", rating: 8.0, year: 2015, platform: "Disney+" },
  { id: 13, title: "Joker", genre: "Drama", language: "English", rating: 8.4, year: 2019, platform: "Prime Video" },
  { id: 14, title: "The Matrix", genre: "Sci-Fi", language: "English", rating: 8.7, year: 1999, platform: "Netflix" },
  { id: 15, title: "Gladiator", genre: "Action", language: "English", rating: 8.5, year: 2000, platform: "Prime Video" },
  { id: 16, title: "Forrest Gump", genre: "Drama", language: "English", rating: 8.8, year: 1994, platform: "Netflix" },
  { id: 17, title: "The Hangover", genre: "Comedy", language: "English", rating: 7.7, year: 2009, platform: "Prime Video" },
  { id: 18, title: "Shutter Island", genre: "Thriller", language: "English", rating: 8.2, year: 2010, platform: "Netflix" },
  { id: 19, title: "Taare Zameen Par", genre: "Drama", language: "Hindi", rating: 8.3, year: 2007, platform: "Netflix" },
  { id: 20, title: "Zindagi Na Milegi Dobara", genre: "Comedy", language: "Hindi", rating: 8.2, year: 2011, platform: "Prime Video" },
  { id: 21, title: "War", genre: "Action", language: "Hindi", rating: 7.5, year: 2019, platform: "Prime Video" },
  { id: 22, title: "Andhadhun", genre: "Thriller", language: "Hindi", rating: 8.2, year: 2018, platform: "Netflix" },
  { id: 23, title: "Lagaan", genre: "Drama", language: "Hindi", rating: 8.1, year: 2001, platform: "Netflix" },
  { id: 24, title: "PK", genre: "Comedy", language: "Hindi", rating: 8.1, year: 2014, platform: "Disney+" },
  { id: 25, title: "RRR", genre: "Action", language: "Hindi", rating: 7.8, year: 2022, platform: "Netflix" },
  { id: 26, title: "Avatar", genre: "Sci-Fi", language: "English", rating: 7.9, year: 2009, platform: "Disney+" },
  { id: 27, title: "Dead Poets Society", genre: "Drama", language: "English", rating: 8.1, year: 1989, platform: "Netflix" },
  { id: 28, title: "Harry Potter and the Philosopher's Stone", genre: "Drama", language: "English", rating: 7.7, year: 2001, platform: "Netflix" },
  { id: 29, title: "Elio", genre: "Sci-Fi", language: "English", rating: 7.9, year: 2025, platform: "Disney+" },
  { id: 30, title: "Spider Man", genre: "Action", language: "English", rating: 8.2, year: 2021, platform: "Prime Video" },
  { id: 31, title: "Wonder Woman", genre: "Action", language: "English", rating: 7.4, year: 2017, platform: "Netflix" },
  { id: 32, title: "Mortal Engines", genre: "Sci-Fi", language: "English", rating: 6.1, year: 2018, platform: "Prime Video" },
  { id: 33, title: "Rampage", genre: "Action", language: "English", rating: 6.1, year: 2018, platform: "Netflix" },
  { id: 34, title: "Alita: Battle Angel", genre: "Sci-Fi", language: "English", rating: 7.3, year: 2019, platform: "Disney+" },
  { id: 35, title: "Black Widow", genre: "Action", language: "English", rating: 6.7, year: 2021, platform: "Disney+" },
  { id: 36, title: "Jurassic World: Dominion", genre: "Action", language: "English", rating: 5.6, year: 2022, platform: "Prime Video" },
  { id: 37, title: "Guardians of the Galaxy", genre: "Sci-Fi", language: "English", rating: 8.0, year: 2023, platform: "Disney+" },
  { id: 38, title: "Interstellar 2", genre: "Action", language: "English", rating: 8.5, year: 2024, platform: "Netflix" },
  { id: 39, title: "Avatar: The Way of Water", genre: "Action", language: "English", rating: 8.5, year: 2024, platform: "Netflix" },
  { id: 40, title: "Dune: Part Two", genre: "Sci-Fi", language: "English", rating: 8.8, year: 2024, platform: "Prime Video" },
  { id: 41, title: "Oppenheimer", genre: "Drama", language: "English", rating: 8.9, year: 2023, platform: "Netflix" },
  { id: 101, title: "Breaking Bad", genre: "Thriller", language: "English", rating: 9.5, year: 2008, platform: "Netflix" },
  { id: 102, title: "Stranger Things", genre: "Sci-Fi", language: "English", rating: 8.7, year: 2016, platform: "Netflix" },
  { id: 103, title: "Dark", genre: "Thriller", language: "German", rating: 8.7, year: 2017, platform: "Netflix" },
  { id: 104, title: "Attack on Titan", genre: "Anime", language: "Japanese", rating: 9.1, year: 2013, platform: "Crunchyroll" },
  { id: 105, title: "Death Note", genre: "Anime", language: "Japanese", rating: 9.0, year: 2006, platform: "Netflix" },
  { id: 106, title: "Jujutsu Kaisen", genre: "Anime", language: "Japanese", rating: 8.6, year: 2020, platform: "Crunchyroll" },
  { id: 107, title: "Demon Slayer", genre: "Anime", language: "Japanese", rating: 8.6, year: 2019, platform: "Netflix" },
  { id: 108, title: "Cyberpunk: Edgerunners", genre: "Anime", language: "English", rating: 8.3, year: 2022, platform: "Netflix" },
  { id: 109, title: "Panchayat", genre: "Comedy", language: "Hindi", rating: 9.0, year: 2020, platform: "Prime Video" },
  { id: 110, title: "The Office", genre: "Comedy", language: "English", rating: 9.0, year: 2005, platform: "Netflix" },
  { id: 111, title: "Brooklyn Nine-Nine", genre: "Comedy", language: "English", rating: 8.4, year: 2013, platform: "Netflix" },
  { id: 112, title: "Money Heist", genre: "Thriller", language: "Spanish", rating: 8.2, year: 2017, platform: "Netflix" },
  { id: 113, title: "Squid Game", genre: "Thriller", language: "Korean", rating: 8.0, year: 2021, platform: "Netflix" },
  { id: 114, title: "Mirzapur", genre: "Crime Drama", language: "Hindi", rating: 8.5, year: 2018, platform: "Prime Video" },
  { id: 115, title: "Sacred Games", genre: "Crime Drama", language: "Hindi", rating: 8.5, year: 2018, platform: "Netflix" },
  { id: 116, title: "Peaky Blinders", genre: "Crime Drama", language: "English", rating: 8.8, year: 2013, platform: "Netflix" },
  { id: 117, title: "Severance", genre: "Sci-Fi", language: "English", rating: 8.7, year: 2022, platform: "Apple TV+" },
  { id: 118, title: "The Boys", genre: "Action", language: "English", rating: 8.7, year: 2019, platform: "Prime Video" }
];

// In-Memory Database (Singleton Pattern)
class MovieDatabase {
  constructor() {
    this.movies = [...INITIAL_MOVIES];
    this.users = new Map([
      ['admin@gmail.com', { name: 'Admin', role: 'ADMIN', password: 'admin123', email: 'admin@gmail.com' }],
      ['admin', { name: 'Admin', role: 'ADMIN', password: 'admin123', email: 'admin@gmail.com' }],
      ['aryan', { name: 'Aryan', role: 'USER', password: 'user123', email: 'aryan@example.com' }]
    ]);
    this.watchlists = new Map([
      ['Admin', [2, 1, 3]],
      ['Aryan', [10, 2, 8]],
      ['Bhai', [1]]
    ]);
    this.mementoHistory = new Map();
    this.notifications = [
      { id: 1, message: "TiMN OTT Recommendation System active on Vercel.", timestamp: new Date().toLocaleTimeString() },
      { id: 2, message: "Observer Pattern initialized with registered observers.", timestamp: new Date().toLocaleTimeString() }
    ];
    this.observers = ["Admin", "Aryan", "Bhai", "John Doe"];
    this.snapshotsCount = 0;
  }

  static getInstance() {
    if (!global.__timnDatabaseInstance) {
      global.__timnDatabaseInstance = new MovieDatabase();
    }
    return global.__timnDatabaseInstance;
  }
}

const db = MovieDatabase.getInstance();

// Helper to parse JSON body
function getBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Role, X-User-Name');
}

// Main Vercel Serverless Handler
module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const parsedUrl = new URL(req.url, 'http://localhost');
  let pathname = parsedUrl.pathname || '';
  const query = Object.fromEntries(parsedUrl.searchParams.entries());

  // Strip prefix if any
  if (pathname.startsWith('/api/')) {
    pathname = pathname.substring(4); // e.g. "/movies"
  } else if (pathname.startsWith('/api')) {
    pathname = pathname.substring(4);
  }

  // Polyfill res.status and res.json for standard Node HTTP compatibility
  if (!res.status) {
    res.status = function(code) {
      this.statusCode = code;
      return this;
    };
  }
  if (!res.json) {
    res.json = function(data) {
      this.setHeader('Content-Type', 'application/json');
      this.end(JSON.stringify(data));
      return this;
    };
  }

  // Normalize trailing slash
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  if (pathname === '' || pathname === '/') {
    return res.status(200).json({
      status: "online",
      message: "TiMN OTT Recommendation System Serverless API is running",
      patterns: 8
    });
  }

  const role = req.headers['x-user-role'] || query.role || 'USER';
  const username = req.headers['x-user-name'] || query.user || query.username || 'User';

  // 1. /api/movies
  if (pathname === '/movies' || pathname === '/movies/') {
    if (req.method === 'GET') {
      const search = (query.search || '').toLowerCase().trim();
      const genre = query.genre || 'Any';
      const platform = query.platform || 'Any';

      const filtered = db.movies.filter(m => {
        const matchesSearch = !search ||
          m.title.toLowerCase().includes(search) ||
          m.genre.toLowerCase().includes(search) ||
          m.language.toLowerCase().includes(search);
        const matchesGenre = genre.toLowerCase() === 'any' || m.genre.toLowerCase() === genre.toLowerCase();
        const matchesPlatform = platform.toLowerCase() === 'any' || m.platform.toLowerCase() === platform.toLowerCase();
        return matchesSearch && matchesGenre && matchesPlatform;
      });

      return res.status(200).json(filtered);
    }

    if (req.method === 'POST') {
      // Protection Proxy Pattern: only ADMIN can add movie
      const body = await getBody(req);
      const userRole = req.headers['x-user-role'] || body.role || role;

      if (userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: "Access Denied! Protection Proxy Pattern blocked operation: Only ADMIN can add movies."
        });
      }

      const nextId = db.movies.length > 0 ? Math.max(...db.movies.map(m => m.id)) + 1 : 1;
      const movie = {
        id: body.id || nextId,
        title: body.title || 'Untitled',
        genre: body.genre || 'Action',
        language: body.language || 'English',
        rating: parseFloat(body.rating) || 7.0,
        year: parseInt(body.year) || 2024,
        platform: body.platform || 'Netflix'
      };

      db.movies.push(movie);
      db.notifications.unshift({
        id: Date.now(),
        message: `New movie added: ${movie.title} (${movie.genre} | ${movie.platform})`,
        timestamp: new Date().toLocaleTimeString()
      });

      return res.status(201).json({
        success: true,
        message: "Movie created successfully via MovieFactory and RealMovieService!",
        movie
      });
    }

    if (req.method === 'DELETE') {
      // Protection Proxy Pattern: only ADMIN can remove movie
      const userRole = req.headers['x-user-role'] || role;
      if (userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: "Access Denied! Protection Proxy Pattern blocked operation: Only ADMIN can remove movies."
        });
      }

      const id = parseInt(query.id);
      const index = db.movies.findIndex(m => m.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: "Movie not found" });
      }

      const removed = db.movies.splice(index, 1)[0];
      db.notifications.unshift({
        id: Date.now(),
        message: `Movie removed: ${removed.title}`,
        timestamp: new Date().toLocaleTimeString()
      });

      return res.status(200).json({
        success: true,
        message: `Movie ID ${id} (${removed.title}) removed successfully via RealMovieService.`
      });
    }
  }

  // 2. /api/top-movies
  if (pathname === '/top-movies') {
    const top = db.movies
      .filter(m => m.rating >= 9.0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
    return res.status(200).json(top);
  }

  // 3. /api/recommend (Chain of Responsibility Pattern)
  if (pathname === '/recommend') {
    let body = {};
    if (req.method === 'POST') {
      body = await getBody(req);
    } else {
      body = query;
    }

    const genre = body.genre || 'Any';
    const language = body.language || 'Any';
    const minRating = parseFloat(body.rating) || 0.0;
    const platform = body.platform || 'Any';

    let current = [...db.movies];
    const trace = [];

    // Step 1: GenreHandler
    const beforeGenre = current.length;
    if (genre.toLowerCase() !== 'any') {
      current = current.filter(m => m.genre.toLowerCase() === genre.toLowerCase());
    }
    trace.push({
      handler: "GenreHandler",
      filterCriteria: `Genre == '${genre}'`,
      inputCount: beforeGenre,
      outputCount: current.length,
      passed: true
    });

    // Step 2: LanguageHandler
    const beforeLang = current.length;
    if (language.toLowerCase() !== 'any') {
      current = current.filter(m => m.language.toLowerCase() === language.toLowerCase());
    }
    trace.push({
      handler: "LanguageHandler",
      filterCriteria: `Language == '${language}'`,
      inputCount: beforeLang,
      outputCount: current.length,
      passed: true
    });

    // Step 3: RatingHandler
    const beforeRating = current.length;
    if (minRating > 0) {
      current = current.filter(m => m.rating >= minRating);
    }
    trace.push({
      handler: "RatingHandler",
      filterCriteria: `Rating >= ${minRating}`,
      inputCount: beforeRating,
      outputCount: current.length,
      passed: true
    });

    // Step 4: PlatformHandler
    const beforePlat = current.length;
    if (platform.toLowerCase() !== 'any') {
      current = current.filter(m => m.platform.toLowerCase() === platform.toLowerCase());
    }
    trace.push({
      handler: "PlatformHandler",
      filterCriteria: `Platform == '${platform}'`,
      inputCount: beforePlat,
      outputCount: current.length,
      passed: true
    });

    return res.status(200).json({
      count: current.length,
      trace,
      movies: current,
      recommendedMovies: current
    });
  }

  // 4. /api/sort (Strategy Pattern)
  if (pathname === '/sort') {
    const strategy = (query.strategy || query.by || 'rating').toLowerCase();
    const sorted = [...db.movies];

    if (strategy === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (strategy === 'year') {
      sorted.sort((a, b) => b.year - a.year);
    } else if (strategy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (strategy === 'popularity') {
      sorted.sort((a, b) => (b.rating * b.year) - (a.rating * a.year));
    }

    return res.status(200).json({
      strategy,
      description: `Sorted by ${strategy}`,
      movies: sorted
    });
  }

  // 5. /api/watchlist
  if (pathname === '/watchlist') {
    const user = query.user || query.username || 'User';

    if (req.method === 'GET') {
      const ids = db.watchlists.get(user) || [];
      const userMovies = ids.map(id => db.movies.find(m => m.id === id)).filter(Boolean);
      return res.status(200).json(userMovies);
    }

    if (req.method === 'POST') {
      const body = await getBody(req);
      const targetUser = body.user || body.username || user;
      const movieId = parseInt(body.movieId);

      if (!targetUser || !movieId) {
        return res.status(400).json({ success: false, message: "user and movieId required" });
      }

      const movie = db.movies.find(m => m.id === movieId);
      if (!movie) {
        return res.status(404).json({ success: false, message: "Movie not found" });
      }

      // Memento Pattern: Save state snapshot before mutating watchlist
      const currentList = db.watchlists.get(targetUser) || [];
      if (!db.mementoHistory.has(targetUser)) {
        db.mementoHistory.set(targetUser, []);
      }
      db.mementoHistory.get(targetUser).push({
        state: [...currentList],
        description: `Before adding '${movie.title}'`,
        timestamp: new Date().toLocaleTimeString()
      });
      db.snapshotsCount++;

      if (!currentList.includes(movieId)) {
        currentList.push(movieId);
        db.watchlists.set(targetUser, currentList);
      }

      return res.status(200).json({
        success: true,
        canUndo: true,
        message: `${movie.title} added to your watchlist.`
      });
    }

    if (req.method === 'DELETE') {
      const targetUser = query.user || query.username || user;
      const movieId = parseInt(query.movieId);

      const currentList = db.watchlists.get(targetUser) || [];
      const movie = db.movies.find(m => m.id === movieId);
      const title = movie ? movie.title : `Movie ${movieId}`;

      // Memento Pattern: Save snapshot before delete
      if (!db.mementoHistory.has(targetUser)) {
        db.mementoHistory.set(targetUser, []);
      }
      db.mementoHistory.get(targetUser).push({
        state: [...currentList],
        description: `Before removing '${title}'`,
        timestamp: new Date().toLocaleTimeString()
      });
      db.snapshotsCount++;

      const updated = currentList.filter(id => id !== movieId);
      db.watchlists.set(targetUser, updated);

      return res.status(200).json({
        success: true,
        canUndo: true,
        message: `${title} removed from watchlist.`
      });
    }
  }

  // 6. /api/watchlist/undo (Memento Pattern)
  if (pathname === '/watchlist/undo') {
    const body = await getBody(req);
    const user = body.user || body.username || query.user || query.username || 'User';

    const history = db.mementoHistory.get(user);
    if (!history || history.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No previous watchlist states available to undo."
      });
    }

    const previousState = history.pop();
    db.watchlists.set(user, previousState.state);

    const restoredMovies = previousState.state
      .map(id => db.movies.find(m => m.id === id))
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      message: `Watchlist state rolled back via Memento Pattern (${previousState.description} at ${previousState.timestamp})`,
      canUndo: history.length > 0,
      watchlist: restoredMovies
    });
  }

  // 7. /api/watchlist/export (Template Method Pattern)
  if (pathname === '/watchlist/export') {
    const user = query.user || query.username || 'User';
    const format = (query.format || 'markdown').toLowerCase();

    const ids = db.watchlists.get(user) || [];
    const movies = ids.map(id => db.movies.find(m => m.id === id)).filter(Boolean);
    const avgRating = movies.length > 0 ? (movies.reduce((s, m) => s + m.rating, 0) / movies.length).toFixed(1) : 0;

    let formatName = "Markdown Table (.md)";
    let content = "";

    if (format === 'html' || format === 'htm') {
      formatName = "HTML Document (.html)";
      content = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Watchlist - ${user}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f17; color: #e2e8f0; margin: 0; padding: 40px; }
  .container { max-width: 900px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
  h1 { margin-top: 0; color: #38bdf8; font-size: 26px; }
  .meta { color: #94a3b8; font-size: 14px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #1e293b; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th { background: #1e293b; color: #94a3b8; font-size: 12px; text-transform: uppercase; padding: 12px 16px; text-align: left; }
  td { padding: 14px 16px; border-bottom: 1px solid #1e293b; font-size: 14px; }
  .badge { padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: #0284c7; color: white; }
  .rating { color: #f59e0b; font-weight: bold; }
  .footer { margin-top: 28px; padding-top: 20px; border-top: 1px solid #1e293b; font-size: 13.5px; color: #94a3b8; }
</style>
</head>
<body>
<div class="container">
  <h1>🎬 CinePattern Watchlist</h1>
  <div class="meta">Curated for: <strong>${user}</strong> &bull; Generated: ${new Date().toLocaleString()}</div>
  <table>
    <thead><tr><th>#</th><th>Title</th><th>Genre</th><th>Language</th><th>Rating</th><th>Year</th><th>Platform</th></tr></thead>
    <tbody>
      ${movies.map((m, i) => `<tr><td>${i + 1}</td><td><strong>${m.title}</strong></td><td>${m.genre}</td><td>${m.language}</td><td class="rating">★ ${m.rating}</td><td>${m.year}</td><td><span class="badge">${m.platform}</span></td></tr>`).join('\n      ')}
    </tbody>
  </table>
  <div class="footer">
    Total Titles: <strong>${movies.length}</strong> &bull; Average Rating: <strong>${avgRating} / 10.0</strong> &bull; <em>Template Method Pattern</em>
  </div>
</div>
</body>
</html>`;
    } else if (format === 'json') {
      formatName = "Structured JSON (.json)";
      content = JSON.stringify({
        reportType: "WatchlistExport",
        pattern: "TemplateMethodPattern",
        user,
        items: movies,
        totalCount: movies.length,
        averageRating: parseFloat(avgRating)
      }, null, 2);
    } else if (format === 'text' || format === 'txt' || format === 'receipt') {
      formatName = "Plain Text Receipt (.txt)";
      content = `========================================================\n          CINEPATTERN WATCHLIST SUMMARY RECEIPT         \n========================================================\n User: ${user.toUpperCase()}\n Export Date: ${new Date().toLocaleString()}\n--------------------------------------------------------\n` +
        movies.map((m, i) => ` [${String(i + 1).padStart(2, '0')}] ${m.title.padEnd(28).slice(0, 28)} | ${m.genre.padEnd(7)} | ${m.rating}* | ${m.platform}`).join('\n') +
        `\n--------------------------------------------------------\n Total Saved Movies: ${movies.length}\n Mean Rating Score:  ${avgRating} / 10.0\n========================================================\n Pattern: Template Method Pattern (WatchlistReportTemplate)\n========================================================\n`;
    } else {
      formatName = "Markdown Table (.md)";
      content = `# 🎬 CinePattern Watchlist Report\n**Curated for:** \`${user}\`  \n**Generated on:** ${new Date().toLocaleString()}\n\n| # | Title | Genre | Language | Rating | Year | Platform |\n|:--|:------|:------|:---------|:-------|:-----|:---------|\n` +
        movies.map((m, i) => `| ${i + 1} | **${m.title}** | ${m.genre} | ${m.language} | ${m.rating} ★ | ${m.year} | ${m.platform} |`).join('\n') +
        `\n\n---\n- **Total Titles Saved:** ${movies.length}\n- **Average IMDb Rating:** ${avgRating} / 10.0\n- *Report generated via Template Method Pattern*\n`;
    }

    return res.status(200).json({
      success: true,
      user,
      format: formatName,
      content
    });
  }

  // 8. /api/login
  if (pathname === '/login') {
    const body = await getBody(req);
    const email = (body.email || body.identifier || '').trim();
    const name = (body.name || '').trim();
    const password = (body.password || '').trim();
    const action = (body.action || 'login').toLowerCase();

    const identifier = email || name;
    if (!identifier) {
      return res.status(400).json({ success: false, message: "Email or Username is required" });
    }

    const isAdmin = identifier.toLowerCase() === 'admin@gmail.com' || identifier.toLowerCase() === 'admin';
    if (isAdmin) {
      if (password === 'admin123') {
        return res.status(200).json({
          success: true,
          name: "Admin",
          role: "ADMIN",
          email: "admin@gmail.com",
          provider: "local",
          message: "Welcome Admin! Full portal and movie management permissions unlocked."
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid Admin password! Admin password must be admin123"
        });
      }
    }

    // Regular user
    const displayName = name || identifier.split('@')[0];
    return res.status(200).json({
      success: true,
      name: displayName,
      role: "USER",
      email: email || `${displayName.toLowerCase()}@cinepattern.com`,
      message: action === 'register' ? "Account created successfully! Welcome to TiMN." : "Logged in successfully!"
    });
  }

  // 9. /api/notifications
  if (pathname === '/notifications') {
    return res.status(200).json({
      count: db.notifications.length,
      notifications: db.notifications
    });
  }

  // 10. /api/notify (Observer Broadcast)
  if (pathname === '/notify') {
    const body = await getBody(req);
    const message = (body.message || '').trim();
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }
    db.notifications.unshift({
      id: Date.now(),
      message: `[Broadcast] ${message}`,
      timestamp: new Date().toLocaleTimeString()
    });
    return res.status(200).json({
      success: true,
      message: `Broadcast sent to all ${db.observers.length} registered observers!`
    });
  }

  // 11. /api/design-patterns
  if (pathname === '/design-patterns') {
    return res.status(200).json({
      singleton: {
        pattern: "Singleton Pattern",
        class: "MovieDatabase",
        description: "Ensures only a single centralized in-memory database instance exists across the entire application.",
        instanceHash: "0x7a3f89b1",
        totalMovies: db.movies.length
      },
      factory: {
        pattern: "Factory Method Pattern",
        class: "MovieFactory",
        description: "Encapsulates movie object creation and parsing from serialized persistence files.",
        methods: ["createMovie(id, title, genre, language, rating, year, platform)", "createMovieFromFile(fileString)"]
      },
      observer: {
        pattern: "Observer Pattern",
        subjectClass: "NotificationService",
        observerClass: "UserObserver",
        description: "Decoupled publish-subscribe pattern notifying subscribed users when new movies or announcements are released.",
        totalSubscribers: db.observers.length,
        subscribers: db.observers,
        recentNotificationsCount: db.notifications.length
      },
      proxy: {
        pattern: "Protection Proxy Pattern",
        interfaceClass: "MovieService",
        proxyClass: "MovieServiceProxy",
        realSubjectClass: "RealMovieService",
        description: "Controls access to sensitive administrative operations (addMovie, removeMovie). Non-admin roles are intercepted and denied before reaching the real service.",
        adminPermission: "Allowed (Full Access)",
        userPermission: "Denied (Read Only)"
      },
      chainOfResponsibility: {
        pattern: "Chain of Responsibility Pattern",
        class: "RecommendationChain",
        description: "Passes the movie catalog along a chain of filtering handlers (Genre -> Language -> Rating -> Platform) where each handler decides what to keep.",
        handlers: ["GenreHandler", "LanguageHandler", "RatingHandler", "PlatformHandler"]
      },
      strategy: {
        pattern: "Strategy Pattern",
        contextClass: "CatalogSorterContext",
        strategyInterface: "MovieSortStrategy",
        description: "Encapsulates dynamic sorting algorithms into interchangeable strategy classes (Rating, Year, Title, Popularity) selectable at runtime.",
        strategies: ["RatingSortStrategy", "YearSortStrategy", "TitleSortStrategy", "PopularitySortStrategy"]
      },
      templateMethod: {
        pattern: "Template Method Pattern",
        abstractClass: "WatchlistReportTemplate",
        templateMethod: "generateReport(username, movies)",
        description: "Defines the skeleton of a watchlist report in a base template class, deferring header, row, and footer formatting to concrete subclasses.",
        concreteTemplates: ["MarkdownWatchlistReport", "PlainTextWatchlistReport", "JsonWatchlistReport", "HtmlWatchlistReport"]
      },
      memento: {
        pattern: "Memento Pattern",
        mementoClass: "WatchlistMemento",
        caretakerClass: "WatchlistCaretaker",
        description: "Captures and externalizes internal watchlist state snapshots, enabling clean undo and rollback of additions and deletions without exposing private fields.",
        totalSnapshotsTaken: db.snapshotsCount
      }
    });
  }

  // 12. /api/auth/supabase-config
  if (pathname === '/auth/supabase-config') {
    return res.status(200).json({
      success: true,
      url: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
      bucket: SUPABASE_BUCKET,
      status: "connected"
    });
  }

  // 13. /api/auth/supabase-signup
  if (pathname === '/auth/supabase-signup') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const body = await getBody(req);
    const email = (body.email || '').trim();
    const password = (body.password || '').trim();
    let name = (body.name || '').trim();
    const role = (body.role || 'USER').trim().toUpperCase();

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and Password are required" });
    }
    if (!name) {
      name = email.split('@')[0];
    }

    try {
      const payload = {
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          role
        }
      };

      const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        db.observers.push(name);
        db.notifications.unshift({
          id: Date.now(),
          message: `New Supabase user ${name} registered as ${role}!`,
          timestamp: new Date().toLocaleTimeString()
        });
        return res.status(200).json({
          success: true,
          message: "Account created in Supabase successfully!",
          name,
          role,
          email
        });
      } else {
        const errorMsg = data.msg || data.message || `Supabase error (HTTP ${response.status})`;
        return res.status(response.status).json({ success: false, message: errorMsg });
      }
    } catch (e) {
      return res.status(500).json({ success: false, message: "Internal error connecting to Supabase: " + e.message });
    }
  }

  // 14. /api/supabase/invoices
  if (pathname === '/supabase/invoices') {
    if (req.method === 'GET') {
      try {
        const response = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${SUPABASE_BUCKET}`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prefix: "", limit: 100 })
        });
        const data = await response.json();
        return res.status(response.status).json(data);
      } catch (e) {
        return res.status(500).json({ error: e.message });
      }
    } else if (req.method === 'POST') {
      try {
        const body = await getBody(req);
        const filename = (body.filename || `report_${Date.now()}.html`).trim();
        const content = body.content || "Empty report";
        const contentType = filename.endsWith('.json') ? 'application/json' : (filename.endsWith('.html') ? 'text/html' : 'text/plain');

        const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${filename}`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': contentType
          },
          body: content
        });

        if (response.ok) {
          const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${filename}`;
          db.notifications.unshift({
            id: Date.now(),
            message: `File '${filename}' uploaded to Supabase Storage bucket '${SUPABASE_BUCKET}'`,
            timestamp: new Date().toLocaleTimeString()
          });
          return res.status(200).json({
            success: true,
            message: `Uploaded to Supabase bucket '${SUPABASE_BUCKET}'!`,
            filename,
            url: publicUrl
          });
        } else {
          const errorText = await response.text();
          let jsonErr;
          try { jsonErr = JSON.parse(errorText); } catch (_) { jsonErr = { error: errorText }; }
          return res.status(response.status).json(jsonErr);
        }
      } catch (e) {
        return res.status(500).json({ error: e.message });
      }
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  }

  // Fallback
  return res.status(404).json({ error: "Endpoint not found", path: req.url });
};
